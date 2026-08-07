import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const today = '2026-07-02';
    console.log("Checking data for date:", today);

    // Check raw count of observations for today
    const { count: obsCount, error: obsError } = await supabase
        .from('observations_6mn')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', `${today}T00:00:00Z`)
        .lte('timestamp', `${today}T23:59:59Z`);

    console.log("observations_6mn count for today:", obsCount, "Error:", obsError);

    // Call RPC get_daily_extremes_fast
    const { data: fastData, error: fastError } = await supabase
        .rpc('get_daily_extremes_fast', {
            target_date: today,
            dept_codes: []
        });
    console.log("get_daily_extremes_fast count:", fastData?.length, "Error:", fastError);

    // Call RPC get_daily_extremes_full
    const { data: fullData, error: fullError } = await supabase
        .rpc('get_daily_extremes_full', {
            target_date: today
        });
    console.log("get_daily_extremes_full count:", fullData?.length, "Error:", fullError);
}
run();
