import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const METEO_KEY = process.env.MF_CONSUMER_KEY || 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const METEO_SECRET = process.env.MF_CONSUMER_SECRET || 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

if (!supabaseUrl || !supabaseKey) {
    console.error('[CRON COLLECT] ❌ Variables Supabase manquantes !');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function refreshToken() {
    console.log('[CRON COLLECT] 🔄 Refreshing Token...');
    const auth = Buffer.from(`${METEO_KEY}:${METEO_SECRET}`).toString('base64');
    const res = await fetch('https://portail-api.meteofrance.fr/token', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials'
    });
    if (!res.ok) throw new Error('Token refresh failed');
    const data = await res.json();
    await supabase.from('api_secrets').upsert({ 
        provider: 'meteo_france', 
        access_token: data.access_token, 
        updated_at: new Date().toISOString() 
    });
    return data.access_token;
}

async function runCronCollect() {
    console.log(`[CRON COLLECT] Démarrage — ${new Date().toISOString()}`);
    
    try {
        const { data: secrets } = await supabase
            .from('api_secrets')
            .select('access_token')
            .eq('provider', 'meteo_france')
            .single();

        let token = secrets?.access_token;
        if (!token) token = await refreshToken();

        // 2. Définir la fenêtre de rolling (lookback de 96 min à 15 min de retard)
        // Météo-France publie généralement avec 25 à 30 min de décalage.
        const now = new Date();
        const startPoint = new Date(Math.floor(now.getTime() / 360000) * 360000 - 96 * 60000); 
        const limitDate = new Date(now.getTime() - 1 * 60000); 

        const slotsToFetch = [];
        let reader = new Date(startPoint);

        while (reader <= limitDate) {
            reader.setMinutes(Math.floor(reader.getMinutes() / 6) * 6, 0, 0);
            slotsToFetch.push(new Date(reader));
            reader = new Date(reader.getTime() + 6 * 60000);
        }

        console.log(`[CRON COLLECT] Création de ${slotsToFetch.length} slots d'observation à valider.`);
        console.log(`[CRON COLLECT] Fenêtre : ${startPoint.toISOString()} → ${limitDate.toISOString()}`);

        const PRIORITY_IDS = ['59343001', '59178001', '59350001', '35281001']; // Lille, Douai, Rennes...
        let totalInserted = 0;

        for (let i = 0; i < slotsToFetch.length; i++) {
            const slot = slotsToFetch[i];
            const isLatest = (i === slotsToFetch.length - 1);
            const dateStr = slot.toISOString().split('.')[0] + 'Z';
            let allBatchData = [];
            let bulkStationsIds = new Set();

            console.log(`[CRON COLLECT] Slot ${dateStr} : Requête API Météo-France...`);
            
            // Appel Bulk
            // ⚡ API v2 : nouveau paramètre raf10 (rafale sur 10min) remplace fxi10 depuis le 16/06/2026
            let url = `https://public-api.meteofrance.fr/public/DPPaquetObs/v2/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`;
            let res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            
            if (res.status === 401) {
                token = await refreshToken();
                res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            }

            if (res.ok) {
                const bulkData = await res.json();
                if (Array.isArray(bulkData)) {
                    allBatchData = [...bulkData];
                    bulkData.forEach(obs => {
                        const sid = obs.id || obs.id_station || obs.geo_id_insee;
                        if (sid) bulkStationsIds.add(sid);
                    });
                    console.log(`   [BULK OK] Trouvé ${bulkData.length} stations.`);
                }
            } else {
                console.log(`   [BULK ERROR] Code HTTP ${res.status} pour le slot ${dateStr}`);
            }

            // Récupération individuelle des stations prioritaires si absentes du bulk
            if (isLatest) {
                const missingPriority = PRIORITY_IDS.filter(sid => !bulkStationsIds.has(sid));
                if (missingPriority.length > 0) {
                    console.log(`   🔍 Récupération de ${missingPriority.length} stations prioritaires manquantes...`);
                    for (const sid of missingPriority) {
                        try {
                            const indivUrl = `https://public-api.meteofrance.fr/public/DPObs/v2/station/infrahoraire-6m?id_station=${sid}&date=${dateStr}&format=json`;
                            let resIndiv = await fetch(indivUrl, { headers: { 'Authorization': `Bearer ${token}` } });
                            if (resIndiv.status === 401) {
                                token = await refreshToken();
                                resIndiv = await fetch(indivUrl, { headers: { 'Authorization': `Bearer ${token}` } });
                            }
                            if (resIndiv.ok) {
                                const indivData = await resIndiv.json();
                                if (Array.isArray(indivData) && indivData[0]) {
                                    allBatchData.push({ ...indivData[0], _source: 'indiv' });
                                    console.log(`      ✅ Station ${sid} récupérée.`);
                                }
                            }
                        } catch (e) {
                            console.log(`      ❌ Échec station ${sid} :`, e.message);
                        }
                        await new Promise(r => setTimeout(r, 200));
                    }
                }
            }

            if (allBatchData.length === 0) continue;

            const rows = allBatchData.map(obs => {
                const stationId = obs.id || obs.id_station || obs.geo_id_insee;
                return {
                    station_id: stationId,
                    timestamp: new Date(obs.validity_time || dateStr).toISOString(),
                    t: obs.t != null ? Math.round((obs.t - 273.15) * 10) / 10 : null,
                    td: obs.td != null ? Math.round((obs.td - 273.15) * 10) / 10 : null,
                    u: obs.u != null ? obs.u : null,
                    ff: obs.ff != null ? Math.round(obs.ff * 3.6) : null,
                    // raf10 = rafale maximale sur 10 min (nouveau nom API v2, remplace fxi10)
                    fxi: obs.raf10 != null ? Math.round(obs.raf10 * 3.6)
                       : obs.fxi10 != null ? Math.round(obs.fxi10 * 3.6)
                       : obs.fxi   != null ? Math.round(obs.fxi   * 3.6) : null,
                    dd: obs.dd != null ? obs.dd : null,
                    pres: obs.pmer != null ? Math.round(obs.pmer / 100 * 10) / 10 : (obs.pres != null ? Math.round(obs.pres / 100 * 10) / 10 : null),
                    rr_per: obs.rr_per != null ? obs.rr_per : 0
                };
            }).filter(r => r.station_id);

            const { error: upsertError } = await supabase
                .from('observations_6mn')
                .upsert(rows, { onConflict: 'station_id, timestamp' });
                
            if (!upsertError) {
                totalInserted += rows.length;
                console.log(`   🚀 ${rows.length} lignes insérées/mises à jour.`);
            } else {
                console.error(`   ❌ Erreur d'insertion pour le slot ${dateStr} :`, upsertError.message);
            }
        }

        if (totalInserted > 0) {
            console.log(`\n[CRON COLLECT] 🔄 Déclenchement de la synchronisation des résumés daily_summaries...`);
            const todayStr = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris' }).format(new Date());
            const { error: syncError } = await supabase.rpc('batch_sync_daily_summaries', { target_date: todayStr });
            if (syncError) console.error("   ❌ Erreur sync RPC :", syncError.message);
            else console.log("   ✅ Synchronisation des résumés terminée avec succès.");
        }

        console.log(`\n[CRON COLLECT] ✅ TERMINÉ. Total des données injectées : ${totalInserted}`);
    } catch (err) {
        console.error('\n[CRON COLLECT] ❌ ERREUR :', err.message || err);
    }
}

runCronCollect();
