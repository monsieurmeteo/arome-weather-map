import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Clés Météo-France (utilisation des variables d'environnement ou fallback sur celles connues)
const consumerKey = process.env.MF_CONSUMER_KEY || 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const consumerSecret = process.env.MF_CONSUMER_SECRET || 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

if (!supabaseUrl || !supabaseKey) {
    console.error('[CRON BACKFILL] ❌ Variables Supabase manquantes !');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getToken() {
    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const resp = await fetch('https://portail-api.meteofrance.fr/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    
    if (!resp.ok) {
        throw new Error(`Erreur lors de la récupération du token: ${resp.status}`);
    }
    
    const data = await resp.json();
    return data.access_token;
}

async function runCronBackfill() {
    console.log(`[CRON BACKFILL] Démarrage — ${new Date().toISOString()}\n`);
    
    try {
        const token = await getToken();
        console.log(`[CRON BACKFILL] Token Météo-France obtenu.`);

        // ⚠️ FIX TIMEZONE : on cible "hier en heure locale Paris" (UTC+1/+2)
        // et non "hier UTC", pour couvrir correctement les heures 00h-02h locales
        const now = new Date();
        const yesterdayParis = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const dateStr = new Intl.DateTimeFormat('sv-SE', {
            timeZone: 'Europe/Paris'
        }).format(yesterdayParis);

        // Offset Europe/Paris pour calculer la fenêtre UTC exacte
        const parisNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
        const utcNow   = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
        const offsetMs = parisNow.getTime() - utcNow.getTime();
        const offsetHours = Math.round(offsetMs / (60 * 60 * 1000));

        console.log(`[CRON BACKFILL] Timezone Paris : UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`);
        console.log(`[CRON BACKFILL] Récupération des données pour le (Paris) : ${dateStr}`);
        
        let totalInserted = 0;

        // Boucle sur les 24h, toutes les 6 minutes (240 requêtes)
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 6) {
                const hStr = h.toString().padStart(2, '0');
                const mStr = m.toString().padStart(2, '0');
                const targetTime = `${dateStr}T${hStr}:${mStr}:00Z`;
                
                try {
                    // ⚡ API v2 : raf10 remplace fxi10 depuis le 16/06/2026
                    const resp = await fetch(`https://public-api.meteofrance.fr/public/DPPaquetObs/v2/paquet/stations/infrahoraire-6m?date=${targetTime}&format=json`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (!resp.ok) {
                        console.log(`   [SKIP] ${targetTime} (HTTP ${resp.status})`);
                        continue;
                    }
                    
                    const stations = await resp.json();
                    
                    // On filtre et formate les données
                    const rows = stations.map(s => ({
                        station_id: s.geo_id_insee || s.id,
                        timestamp: targetTime,
                        t: s.t ? s.t - 273.15 : null, // Conversion Kelvin -> Celsius
                        u: s.u,
                        ff: s.ff,
                        fxi: s.raf10 != null ? s.raf10 : (s.fxi10 || s.fxi || null),
                        rr_per: s.rr_per,
                        created_at: new Date().toISOString()
                    })).filter(r => r.t !== null); // On ne garde que les stations avec au moins la temp
                    
                    if (rows.length === 0) continue;

                    // Insertion en base par lots de 500 pour ne pas surcharger
                    let batchCount = 0;
                    for (let i = 0; i < rows.length; i += 500) {
                        const batch = rows.slice(i, i + 500);
                        const { error } = await supabase
                            .from('observations_6mn')
                            .upsert(batch, { onConflict: 'station_id, timestamp' });
                            
                        if (error) throw error;
                        batchCount += batch.length;
                    }
                    
                    totalInserted += batchCount;
                    console.log(`   ✅ ${targetTime}: ${batchCount} stations traitées.`);
                    
                    // Petite pause pour respecter les limites de l'API (Rate Limit)
                    await new Promise(r => setTimeout(r, 400));
                    
                } catch (err) {
                    console.error(`   ❌ Erreur pour ${targetTime}:`, err.message);
                }
            }
        }
        
        console.log(`\n[CRON BACKFILL] ✅ TERMINÉ. Total des insertions/mises à jour : ${totalInserted}`);
        
    } catch (err) {
        console.error('\n[CRON BACKFILL] ❌ ERREUR FATALE:', err.message || err);
        process.exit(1);
    }
}

runCronBackfill();
