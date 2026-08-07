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

async function backfillPastDays6mn() {
    console.log('--- BACKFILLING PAST DAYS INTO 6MN TABLE ---');
    const token = await getToken();
    
    // We fetch 4 points per day (00h, 06h, 12h, 18h) to be fast and cover the whole history
    // for ALL stations.
    const days = ['2026-04-26', '2026-04-27', '2026-04-28', '2026-04-29'];
    const hours = ['00', '06', '12', '18'];
    
    for (const day of days) {
        for (const h of hours) {
            const targetTime = `${day}T${h}:00:00Z`;
            console.log(`Fetching ${targetTime}...`);
            
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
                await new Promise(r => setTimeout(r, 500));
                
            } catch (err) {
                console.error(`❌ Error for ${targetTime}:`, err.message);
            }
        }
    }
    
    console.log('--- PAST DAYS BACKFILL FINISHED ---');
}

backfillPastDays6mn();
