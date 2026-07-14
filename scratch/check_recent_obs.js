import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log("Checking recent observations in observations_6mn...");

    // Fetch 10 recent rows where t is not null or ff is not null
    const { data, error } = await supabase
        .from('observations_6mn')
        .select('*')
        .not('ff', 'is', null)
        .order('timestamp', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Recent observations with wind (ff):", data);
    }
}
run();
