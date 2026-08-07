import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function testUpsert() {
    console.log("Testing single upsert...");
    const { data, error } = await supabase
        .from('daily_summaries')
        .upsert({
            station_id: '02173002',
            date: '2026-02-01',
            rain_total: 5.4,
            updated_at: new Date().toISOString()
        }, { onConflict: 'station_id,date' });

    if (error) console.error("Error:", error);
    else console.log("Success:", data);
}

testUpsert();
