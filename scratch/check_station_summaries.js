import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const stations = ['59343001', '35281001', '59178001'];
    console.log("Checking daily summaries for Lille (59343001), Rennes (35281001), Douai (59178001)...");

    const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .in('station_id', stations)
        .gte('date', '2026-06-17')
        .order('date', { ascending: false });

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Summaries:");
        console.log(data.map(d => ({
            station_id: d.station_id,
            date: d.date,
            wind_mean_max: d.wind_mean_max,
            wind_gust_max: d.wind_gust_max,
            wind_gust_time: d.wind_gust_time
        })).slice(0, 15));
    }
}
run();
