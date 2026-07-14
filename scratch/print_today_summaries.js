import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const today = '2026-07-02';
    console.log("Fetching summaries for:", today);

    const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .eq('date', today)
        .not('wind_mean_max', 'is', null)
        .gt('wind_mean_max', 0)
        .limit(5);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Today summaries sample:", data);
    }
}
run();
