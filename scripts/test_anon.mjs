import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function test() {
    const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_ANON_KEY
    );

    console.log("Testing with Anon Key...");
    const { data, error } = await supabase.from('stations').select('id').limit(5);

    if (error) {
        console.error("Anon Key Error:", error);
    } else {
        console.log("Anon Key Success! Data count:", data.length);
    }
}

test();
