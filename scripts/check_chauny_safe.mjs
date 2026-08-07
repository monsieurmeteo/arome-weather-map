import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function checkChauny() {
    console.log("Fetching Chauny day by day...");
    let total = 0;
    let days = 0;
    for (let i = 1; i <= 28; i++) {
        const date = `2026-02-${String(i).padStart(2, '0')}`;
        const { data, error } = await supabase
            .from('daily_summaries')
            .select('rain_total')
            .eq('station_id', '02173002')
            .eq('date', date)
            .maybeSingle();

        if (data) {
            total += data.rain_total || 0;
            days++;
        }
    }
    console.log(`Chauny: ${days}/28 days. Total: ${total.toFixed(1)}mm`);
}

checkChauny();
