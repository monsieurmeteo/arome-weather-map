import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function repairDailySummary(stationId, dateStr) {
    const start = new Date(dateStr); start.setUTCHours(0, 0, 0, 0);
    const end = new Date(dateStr); end.setUTCHours(23, 59, 59, 999);

    // Fetch all 6-minute points for the day
    const { data: points, error: e1 } = await supabase
        .from('observations_6mn')
        .select('*')
        .eq('station_id', stationId)
        .gte('timestamp', start.toISOString())
        .lte('timestamp', end.toISOString());

    if (e1) {
        console.error(`Error fetching 6mn points for ${dateStr}:`, e1);
        return;
    }

    if (!points || points.length === 0) {
        console.log(`No points found for ${dateStr}`);
        return;
    }

    let minT = Infinity;
    let maxT = -Infinity;
    let maxWind = 0;
    let rainTotal = 0;

    for (const p of points) {
        if (p.t !== null) {
            if (p.t < minT) minT = p.t;
            if (p.t > maxT) maxT = p.t;
        }
        if (p.fxi !== null) {
            if (p.fxi > maxWind) maxWind = p.fxi;
        }
        if (p.rr_per !== null && p.rr_per > 0) {
            rainTotal += p.rr_per; // Assuming rr_per is the rainfall in that 6mn period
        }
    }

    if (minT === Infinity) minT = null;
    if (maxT === -Infinity) maxT = null;

    // Upsert into daily_summaries
    const summary = {
        station_id: stationId,
        date: dateStr,
        temp_min: minT,
        temp_max: maxT,
        wind_gust_max: maxWind > 0 ? maxWind : null,
        rain_total: rainTotal > 0 ? Number(rainTotal.toFixed(1)) : 0,
        updated_at: new Date().toISOString()
    };

    const { error: e2 } = await supabase
        .from('daily_summaries')
        .upsert(summary, { onConflict: 'station_id, date' });

    if (e2) {
        console.error(`Error upserting summary for ${dateStr}:`, e2);
    } else {
        console.log(`✅ Fixed daily summary for ${dateStr}: Tn=${minT}, Tx=${maxT}, Rr=${summary.rain_total}`);
    }
}

async function run() {
    const douai = '59178001';
    const start = new Date('2026-02-01');
    const today = new Date();
    let iter = new Date(start);
    while (iter <= today) {
        await repairDailySummary(douai, iter.toISOString().split('T')[0]);
        iter.setDate(iter.getDate() + 1);
    }
}
run();
