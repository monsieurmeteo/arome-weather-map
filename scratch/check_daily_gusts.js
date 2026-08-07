import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log("Checking daily summaries for today and yesterday...");

    const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .gte('date', '2026-07-01')
        .order('date', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Daily summaries:");
        console.log(data.map(d => ({
            station_id: d.station_id,
            date: d.date,
            wind_mean_max: d.wind_mean_max,
            wind_gust_max: d.wind_gust_max,
            wind_gust_time: d.wind_gust_time
        })));

        const withGust = data.filter(d => d.wind_gust_max !== null);
        console.log(`Out of ${data.length} records, ${withGust.length} have wind_gust_max populated.`);
    }
}
run();
