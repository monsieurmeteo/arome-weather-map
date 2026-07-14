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
        throw new Error(`Token fetch failed: ${resp.status}`);
    }
    
    const data = await resp.json();
    return data.access_token;
}

async function run() {
    console.log('🚀 Starting manual backfill for today\'s 00h00-02h00 Paris gap (May 28)...');
    try {
        const token = await getToken();
        console.log('✅ Token obtained.');

        // Paris 00h00-02h00 (UTC 2026-05-27T22:00:00Z to 2026-05-28T00:00:00Z)
        const start = new Date('2026-05-27T22:00:00Z');
        const end = new Date('2026-05-28T00:00:00Z');

        const slots = [];
        let current = new Date(start);
        while (current <= end) {
            slots.push(new Date(current));
            current = new Date(current.getTime() + 6 * 60000);
        }

        console.log(`Need to fetch ${slots.length} slots...`);
        let totalInserted = 0;

        for (const slot of slots) {
            const dateStr = slot.toISOString().split('.')[0] + 'Z';
            console.log(`Fetching slot ${dateStr}...`);
            
            const resp = await fetch(`https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!resp.ok) {
                console.log(`   [SKIP] ${dateStr} (HTTP ${resp.status})`);
                continue;
            }

            const stations = await resp.json();
            if (!Array.isArray(stations) || stations.length === 0) continue;

            const rows = stations.map(s => {
                const stationId = s.geo_id_insee || s.id;
                return {
                    station_id: stationId,
                    timestamp: dateStr,
                    t: s.t != null ? Math.round((s.t - 273.15) * 10) / 10 : null,
                    td: s.td != null ? Math.round((s.td - 273.15) * 10) / 10 : null,
                    u: s.u != null ? s.u : null,
                    ff: s.ff != null ? Math.round(s.ff * 3.6) : null,
                    fxi: s.fxi10 != null ? Math.round(s.fxi10 * 3.6) : (s.fxi != null ? Math.round(s.fxi * 3.6) : null),
                    dd: s.dd != null ? s.dd : null,
                    pres: s.pmer != null ? Math.round(s.pmer / 100 * 10) / 10 : (s.pres != null ? Math.round(s.pres / 100 * 10) / 10 : null),
                    rr_per: s.rr_per != null ? s.rr_per : 0
                };
            }).filter(r => r.station_id && r.t !== null);

            if (rows.length === 0) continue;

            const { error } = await supabase.from('observations_6mn').upsert(rows, { onConflict: 'station_id, timestamp' });
            if (error) {
                console.error(`   ❌ Insertion error for ${dateStr}:`, error.message);
            } else {
                totalInserted += rows.length;
                console.log(`   ✅ ${rows.length} rows inserted.`);
            }

            await new Promise(r => setTimeout(r, 400));
        }

        console.log(`\n🎉 Backfill finished! Total rows inserted: ${totalInserted}`);

        if (totalInserted > 0) {
            console.log('🔄 Re-syncing summaries...');
            const { error: syncError } = await supabase.rpc('batch_sync_daily_summaries', { target_date: '2026-05-28' });
            if (syncError) console.error('   ❌ RPC sync failed:', syncError.message);
            else console.log('   ✅ Summaries sync completed successfully.');
        }

    } catch (e) {
        console.error('❌ Fatal error:', e.message);
    }
}

run();
