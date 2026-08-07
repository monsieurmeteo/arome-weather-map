import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Clés Météo-France
const consumerKey = process.env.MF_CONSUMER_KEY || 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const consumerSecret = process.env.MF_CONSUMER_SECRET || 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

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

async function recoverData() {
    console.log('--- DEEP BACKFILL STARTING ---');
    const dates = [
        '2026-05-09',
        '2026-05-10'
    ];

    let totalInserted = 0;

    for (const dateStr of dates) {
        console.log(`\nProcessing date: ${dateStr}`);
        
        const now = new Date();
        const isToday = dateStr === now.toISOString().split('T')[0];
        const currentHour = now.getUTCHours();

        for (let h = 0; h < 24; h++) {
            if (isToday && h > currentHour) {
                console.log(`Skipping future hour ${h} for today.`);
                break;
            }

            for (let m = 0; m < 60; m += 6) {
                const hStr = h.toString().padStart(2, '0');
                const mStr = m.toString().padStart(2, '0');
                const targetTime = `${dateStr}T${hStr}:${mStr}:00Z`;
                
                try {
                    // Refresh token for every request to bypass weird 401s
                    const token = await getToken();
                    
                    const resp = await fetch(`https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/infrahoraire-6m?date=${targetTime}&format=json`, {
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

                    let batchCount = 0;
                    for (let i = 0; i < rows.length; i += 500) {
                        const batch = rows.slice(i, i + 500);
                        const { error } = await supabase
                            .from('observations_6mn').upsert(batch, { onConflict: 'station_id, timestamp' });
                        if (error) throw error;
                        batchCount += batch.length;
                    }
                    
                    totalInserted += batchCount;
                    console.log(`   ✅ ${targetTime}: ${batchCount} stations traitées.`);
                    
                    await new Promise(r => setTimeout(r, 1000));
                    
                } catch (err) {
                    console.error(`   ❌ Erreur pour ${targetTime}:`, err.message);
                }
            }
        }
    }
    
    console.log(`\n--- DEEP BACKFILL FINISHED. Total upserted: ${totalInserted} ---`);
}

recoverData();
