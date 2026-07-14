import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function test() {
    console.log("URL:", process.env.VITE_SUPABASE_URL);
    const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_ANON_KEY
    );

    console.log("Querying stations...");
    // Just select one record
    const { data, error } = await supabase.from('stations').select('id').limit(1);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Success! Found:", data);
    }
}

test();
