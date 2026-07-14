import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';
const consumerKey = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const consumerSecret = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

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
    const data = await resp.json();
    return data.access_token;
}

async function fullBackfillHourly() {
    console.log('--- STARTING FULL HOURLY BACKFILL (24 pts/day) ---');
    const token = await getToken();
    
    const days = ['2026-04-26', '2026-04-27', '2026-04-28', '2026-04-29'];
    
    for (const day of days) {
        console.log(`\n--- Processing ${day} ---`);
        for (let h = 0; h < 24; h++) {
            const hStr = h.toString().padStart(2, '0');
            const targetTime = `${day}T${hStr}:00:00Z`;
            
            try {
                const resp = await fetch(`https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/horaire?date=${targetTime}&format=json`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (resp.status !== 200) continue;
                
                const stations = await resp.json();
                const rows = stations.map(s => ({
                    station_id: s.geo_id_insee || s.id,
                    timestamp: targetTime,
                    t: s.t ? s.t - 273.15 : null,
                    u: s.u,
                    ff: s.ff,
                    fxi: s.fxi,
                    rr_per: s.rr1,
                    created_at: new Date().toISOString()
                })).filter(r => r.t !== null);
                
                // Chunked upsert
                for (let i = 0; i < rows.length; i += 500) {
                    const batch = rows.slice(i, i + 500);
                    await supabase
                        .from('observations_6mn')
                        .upsert(batch, { onConflict: 'station_id, timestamp' });
                }
                console.log(`✅ Success for ${targetTime}: ${rows.length} stations.`);
                
                // Adaptive sleep to respect rate limits
                await new Promise(r => setTimeout(r, 800));
                
            } catch (err) {
                console.error(`❌ Error for ${targetTime}:`, err.message);
            }
        }
    }
    
    console.log('\n--- FULL HOURLY BACKFILL FINISHED ---');
}

fullBackfillHourly();
