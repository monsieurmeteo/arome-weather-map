import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log("Checking recent observations in observations_horaire...");

    const { data, error } = await supabase
        .from('observations_horaire')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Recent hourly observations:", data);
    }
}
run();
