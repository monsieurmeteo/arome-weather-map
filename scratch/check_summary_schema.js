import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase
        .from('daily_summaries')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("daily_summaries record keys:", Object.keys(data[0] || {}));
        console.log("Sample record:", data[0]);
    }
}
run();
