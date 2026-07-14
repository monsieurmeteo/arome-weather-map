import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase
        .from('lightning_strikes')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Datatypes check:", data);
        if (data && data[0]) {
            console.log("lat type:", typeof data[0].lat);
            console.log("lon type:", typeof data[0].lon);
        }
    }
}
run();
