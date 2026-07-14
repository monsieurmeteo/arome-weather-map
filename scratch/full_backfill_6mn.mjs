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

async function fullBackfill6mn() {
    console.log('--- STARTING FULL 6MN BACKFILL FOR ALL STATIONS ---');
    const token = await getToken();
    
    const date = '2026-04-30';
    // Loops every 12 minutes (to be faster while still having good resolution)
    // or every 6 minutes if we really want 100% perfection.
    // Let's do every 6 minutes since the user insisted.
    
    for (let h = 0; h < 10; h++) {
        for (let m = 0; m < 60; m += 6) {
            const hStr = h.toString().padStart(2, '0');
            const mStr = m.toString().padStart(2, '0');
            const targetTime = `${date}T${hStr}:${mStr}:00Z`;
            
            console.log(`Fetching 6mn data for ${targetTime}...`);
            
            try {
                const resp = await fetch(`https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/infrahoraire-6m?date=${targetTime}&format=json`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (resp.status !== 200) {
                    console.log(`Skipping ${targetTime} (Status ${resp.status})`);
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
                
                // Chunked upsert
                for (let i = 0; i < rows.length; i += 500) {
                    const batch = rows.slice(i, i + 500);
                    const { error } = await supabase
                        .from('observations_6mn')
                        .upsert(batch, { onConflict: 'station_id, timestamp' });
                }
                console.log(`✅ Success for ${targetTime}: ${rows.length} stations.`);
                
                // Small sleep to avoid rate limiting
                await new Promise(r => setTimeout(r, 500));
                
            } catch (err) {
                console.error(`❌ Error for ${targetTime}:`, err.message);
            }
        }
    }
    
    console.log('--- FULL 6MN BACKFILL FINISHED ---');
}

fullBackfill6mn();
