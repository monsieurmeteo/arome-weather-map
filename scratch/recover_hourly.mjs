import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const consumerKey = process.env.MF_CONSUMER_KEY || 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const consumerSecret = process.env.MF_CONSUMER_SECRET || 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getToken() {
    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const resp = await fetch('https://portail-api.meteofrance.fr/token', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials'
    });
    const data = await resp.json();
    return data.access_token;
}

async function recoverHourly() {
    console.log('--- HOURLY BACKFILL STARTING (Plan B for May 5-8) ---');
    const dates = ['2026-05-05', '2026-05-06', '2026-05-07', '2026-05-08'];
    let totalInserted = 0;

    for (const dateStr of dates) {
        console.log(`\nProcessing hourly date: ${dateStr}`);
        for (let h = 0; h < 24; h++) {
            const hStr = h.toString().padStart(2, '0');
            const targetTime = `${dateStr}T${hStr}:00:00Z`;
            
            try {
                const token = await getToken();
                const resp = await fetch(`https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/horaire?date=${targetTime}&format=json`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!resp.ok) {
                    if (resp.status !== 204) console.log(`   [SKIP] ${targetTime} (HTTP ${resp.status})`);
                    continue;
                }
                
                const stations = await resp.json();
                const rows = stations.map(s => ({
                    station_id: s.geo_id_insee || s.id,
                    timestamp: targetTime,
                    t: s.t ? s.t - 273.15 : null,
                    u: s.u,
                    ff: s.ff,
                    fxi: s.fxi10 || s.fxi,
                    rr_per: s.rr_per,
                    created_at: new Date().toISOString()
                })).filter(r => r.t !== null);
                
                if (rows.length === 0) continue;

                for (let i = 0; i < rows.length; i += 500) {
                    const batch = rows.slice(i, i + 500);
                    await supabase.from('observations_6mn').upsert(batch, { onConflict: 'station_id, timestamp' });
                }
                totalInserted += rows.length;
                console.log(`   ✅ ${targetTime}: ${rows.length} stations traitées.`);
                await new Promise(r => setTimeout(r, 1000));
            } catch (err) {
                console.error(`   ❌ Erreur pour ${targetTime}:`, err.message);
            }
        }
    }
    console.log(`--- HOURLY BACKFILL FINISHED. Total: ${totalInserted} ---`);
}
recoverHourly();
