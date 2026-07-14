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

async function deepBackfillStation(stationId) {
    console.log(`--- DEEP BACKFILL FOR ${stationId} ---`);
    const token = await getToken();
    
    // We fetch for each day
    const days = ['2026-04-26', '2026-04-27', '2026-04-28', '2026-04-29', '2026-04-30'];
    
    for (const day of days) {
        console.log(`Fetching 6mn data for ${stationId} on ${day}...`);
        // Using DPObs station-specific API with date
        // Note: some APIs might need a full ISO string
        const resp = await fetch(`https://public-api.meteofrance.fr/public/DPObs/v1/station/infrahoraire-6m?id_station=${stationId}&date=${day}T12:00:00Z&format=json`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (resp.status === 200) {
            const data = await resp.json();
            const observations = data.results || [];
            console.log(`Found ${observations.length} points.`);
            
            const rows = observations.map(s => ({
                station_id: stationId,
                timestamp: s.validity_time,
                t: s.t ? s.t - 273.15 : null,
                u: s.u,
                ff: s.ff,
                fxi: s.fxi,
                rr_per: s.rr_per,
                created_at: new Date().toISOString()
            })).filter(r => r.t !== null);
            
            const { error } = await supabase
                .from('observations_6mn')
                .upsert(rows, { onConflict: 'station_id, timestamp' });
                
            if (error) console.error(`❌ Error for ${day}:`, error.message);
        } else {
            console.error(`❌ API Error for ${day}: ${resp.status}`);
        }
        
        await new Promise(r => setTimeout(r, 1000)); // Sleep to avoid quota
    }
}

deepBackfillStation('59178001'); // Douai
