import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function testSimple() {
    console.log("Checking stations table...");
    const { data, count, error } = await supabase
        .from('stations')
        .select('*', { count: 'exact', head: true });

    if (error) console.error("Error:", error);
    else console.log("Total stations in DB:", count);

    console.log("Checking Chauny summaries...");
    const { data: cData, error: cErr } = await supabase
        .from('daily_summaries')
        .select('rain_total, date')
        .eq('station_id', '02173002')
        .order('date');

    if (cErr) console.error("Error Chauny:", cErr);
    else {
        const total = cData.reduce((acc, r) => acc + (r.rain_total || 0), 0);
        console.log(`Chauny: ${cData.length} days found. Total Rain: ${total.toFixed(1)}mm`);
    }
}

testSimple();
