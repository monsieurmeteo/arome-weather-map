// Re-backfill complet du 03/07/2026 depuis 00h00 UTC avec API v2 + raf10
// L'API MF garde 24h, donc on peut encore tout récupérer aujourd'hui !

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const KEY    = process.env.MF_CONSUMER_KEY    || 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const SECRET = process.env.MF_CONSUMER_SECRET || 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

async function getToken() {
    const auth = Buffer.from(`${KEY}:${SECRET}`).toString('base64');
    const res = await fetch('https://portail-api.meteofrance.fr/token', {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials'
    });
    return (await res.json()).access_token;
}

async function main() {
    console.log(`[BACKFILL TODAY] Démarrage — ${new Date().toISOString()}`);
    console.log(`[BACKFILL TODAY] ⚡ Utilise API v2 + raf10`);
    
    const token = await getToken();
    
    // Générer tous les slots de 00:00 à maintenant - 6mn
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // 2026-07-03
    const startUTC = new Date(`${todayStr}T00:00:00Z`);
    const endUTC = new Date(Math.floor(today.getTime() / 360000) * 360000 - 6 * 60000); // -6mn
    
    const slots = [];
    let cur = new Date(startUTC);
    while (cur <= endUTC) {
        slots.push(new Date(cur));
        cur = new Date(cur.getTime() + 6 * 60000);
    }
    
    console.log(`[BACKFILL TODAY] ${slots.length} slots à récupérer (${startUTC.toISOString()} → ${endUTC.toISOString()})`);
    
    let totalInserted = 0;
    let errors = 0;
    
    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const dateStr = slot.toISOString().replace('.000Z', 'Z');
        
        try {
            // API v2 - raf10
            const res = await fetch(
                `https://public-api.meteofrance.fr/public/DPPaquetObs/v2/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (!res.ok) {
                if (i % 10 === 0) console.log(`  [SKIP] ${dateStr} (HTTP ${res.status})`);
                errors++;
                continue;
            }
            
            const stations = await res.json();
            if (!Array.isArray(stations) || stations.length === 0) continue;
            
            const rows = stations.map(s => ({
                station_id: s.geo_id_insee || s.id,
                timestamp: new Date(s.validity_time || dateStr).toISOString(),
                t: s.t != null ? Math.round((s.t - 273.15) * 10) / 10 : null,
                td: s.td != null ? Math.round((s.td - 273.15) * 10) / 10 : null,
                u: s.u ?? null,
                ff: s.ff != null ? Math.round(s.ff * 3.6) : null,
                // raf10 = rafale API v2 (en m/s → km/h)
                fxi: s.raf10 != null ? Math.round(s.raf10 * 3.6)
                   : s.fxi10 != null ? Math.round(s.fxi10 * 3.6)
                   : s.fxi   != null ? Math.round(s.fxi   * 3.6) : null,
                dd: s.dd ?? null,
                pres: s.pmer != null ? Math.round(s.pmer / 100 * 10) / 10
                    : s.pres != null ? Math.round(s.pres / 100 * 10) / 10 : null,
                rr_per: s.rr_per ?? 0
            })).filter(r => r.station_id); // Tous les postes, pas seulement ceux avec température
            
            // Insérer par lots de 500
            for (let j = 0; j < rows.length; j += 500) {
                const batch = rows.slice(j, j + 500);
                const { error } = await supabase
                    .from('observations_6mn')
                    .upsert(batch, { onConflict: 'station_id, timestamp' });
                if (error) throw error;
            }
            
            totalInserted += rows.length;
            
            // Log toutes les 10 étapes
            if (i % 10 === 0 || i === slots.length - 1) {
                const rafCount = stations.filter(s => s.raf10 !== null).length;
                console.log(`  [${i+1}/${slots.length}] ${dateStr} — ${rows.length} stations (${rafCount} avec rafale raf10)`);
            }
            
            // Pause pour respecter le rate limit API
            await new Promise(r => setTimeout(r, 350));
            
        } catch (e) {
            console.error(`  ❌ Erreur ${dateStr}:`, e.message);
            errors++;
        }
    }
    
    console.log(`\n[BACKFILL TODAY] Insertion terminée : ${totalInserted} lignes — ${errors} erreurs`);
    
    // Recalculer les résumés du jour
    console.log(`\n[BACKFILL TODAY] Recalcul daily_summaries pour ${todayStr}...`);
    const { error: syncError } = await supabase.rpc('batch_sync_daily_summaries', { target_date: todayStr });
    if (syncError) console.error('❌ Erreur sync:', syncError.message);
    else console.log('✅ daily_summaries mis à jour avec les vraies rafales !');
    
    console.log(`\n[BACKFILL TODAY] ✅ TERMINÉ.`);
}

main().catch(console.error);
