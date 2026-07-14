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

async function backfill() {
    console.log('--- STARTING MASSIVE BACKFILL ---');
    const token = await getToken();
    
    // We fetch data for the end of each missing day (approx 22h UTC)
    // to get the best tx/tn/rr for the whole day.
    const dates = ['2026-04-26', '2026-04-27', '2026-04-28', '2026-04-29'];
    
    for (const date of dates) {
        console.log(`\nProcessing ${date}...`);
        const targetTime = `${date}T22:00:00Z`;
        
        try {
            const resp = await fetch(`https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/horaire?date=${targetTime}&format=json`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (resp.status !== 200) {
                console.error(`❌ API Error for ${date}: ${resp.status}`);
                continue;
            }
            
            const stations = await resp.json();
            console.log(`Fetched ${stations.length} stations. Preparing upsert...`);
            
            const rows = stations.map(s => ({
                station_id: s.geo_id_insee || s.id,
                date: date,
                temp_min: s.tn ? s.tn - 273.15 : null,
                temp_max: s.tx ? s.tx - 273.15 : null,
                wind_gust_max: s.fxi,
                wind_gust_time: s.validity_time,
                rain_total: s.rr1, // Best effort for rain
                updated_at: new Date().toISOString()
            })).filter(r => r.temp_min !== null || r.temp_max !== null);
            
            // Upsert in batches of 500
            for (let i = 0; i < rows.length; i += 500) {
                const batch = rows.slice(i, i + 500);
                const { error } = await supabase
                    .from('daily_summaries')
                    .upsert(batch, { onConflict: 'station_id, date' });
                if (error) console.error(`❌ Upsert error for ${date} batch ${i}:`, error.message);
            }
            
            console.log(`✅ Success for ${date}: ${rows.length} records updated.`);
            
        } catch (err) {
            console.error(`❌ Fatal error for ${date}:`, err.message);
        }
    }
    
    console.log('\n--- BACKFILL FINISHED ---');
}

backfill();
