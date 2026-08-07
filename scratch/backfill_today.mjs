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

async function backfillToday() {
    console.log('--- BACKFILLING TODAY (April 30th) ---');
    const token = await getToken();
    
    // Fetch every hour from 00:00 to 09:00 UTC
    const hours = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09'];
    const date = '2026-04-30';
    
    for (const h of hours) {
        const targetTime = `${date}T${h}:00:00Z`;
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
            
            // Upsert into observations_6mn
            for (let i = 0; i < rows.length; i += 500) {
                const batch = rows.slice(i, i + 500);
                const { error } = await supabase
                    .from('observations_6mn')
                    .upsert(batch, { onConflict: 'station_id, timestamp' });
                if (error) console.error(`❌ Error for ${h}h:`, error.message);
            }
            console.log(`✅ Success for ${h}h: ${rows.length} records.`);
            
        } catch (err) {
            console.error(`❌ Error for ${h}h:`, err.message);
        }
    }
    
    console.log('--- TODAY BACKFILL FINISHED ---');
}

backfillToday();
