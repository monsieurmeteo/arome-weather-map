import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

console.log("URL:", url);
console.log("Key length:", key ? key.length : 0);

const supabase = createClient(url, key);

async function check() {
    const { data, error } = await supabase.from('observations_6mn').select('station_id').limit(1);
    if (error) {
        console.log("ERROR MESSAGE:", error.message);
        console.log("ERROR DETAILS:", error.details);
        console.log("ERROR HINT:", error.hint);
        console.log("ERROR CODE:", error.code);
    } else {
        console.log("SUCCESS:", data);
    }
}

check();
