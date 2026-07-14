import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function testConnection() {
    console.log("Testing connection...");
    const { data, count, error } = await supabase
        .from('daily_summaries')
        .select('*', { count: 'exact', head: true })
        .limit(1);

    if (error) console.error("Error:", error);
    else console.log("Success, found records:", count);
}

testConnection();
