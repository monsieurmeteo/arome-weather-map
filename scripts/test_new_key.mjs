import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function check() {
    console.log("Checking stations table...");
    const { data, error } = await supabase.from('stations').select('*').limit(1);
    if (error) {
        console.log("STATIONS ERROR:", error);
    } else {
        console.log("STATIONS SUCCESS:", data);
    }

    console.log("Checking observations_6mn table...");
    const { data: d6, error: e6 } = await supabase.from('observations_6mn').select('*').limit(1);
    if (e6) {
        console.log("OBS6MN ERROR:", e6);
    } else {
        console.log("OBS6MN SUCCESS:", d6);
    }
}

check();
