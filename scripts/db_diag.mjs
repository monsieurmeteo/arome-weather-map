import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function diagnose() {
    console.log("--- Supabase Health Check ---");
    const start = Date.now();
    try {
        console.log("1. Testing 'stations' (Small table)...");
        const { count, error: e1 } = await supabase.from('stations').select('*', { count: 'exact', head: true });
        console.log(`   Result: ${count} stations in ${Date.now() - start}ms. Error:`, e1);

        const t2 = Date.now();
        console.log("2. Testing 'daily_summaries' (Medium table) count...");
        const { count: c2, error: e2 } = await supabase.from('daily_summaries').select('*', { count: 'exact', head: true });
        console.log(`   Result: ${c2} summaries in ${Date.now() - t2}ms. Error:`, e2);

        const t3 = Date.now();
        console.log("3. Testing 'observations_6mn' (Large table) LATEST...");
        const { data, error: e3 } = await supabase.from('observations_6mn').select('timestamp').order('timestamp', { ascending: false }).limit(1);
        console.log(`   Result: Latest is ${data?.[0]?.timestamp} in ${Date.now() - t3}ms. Error:`, e3);

        const t4 = Date.now();
        console.log("4. Testing RPC 'get_france_live'...");
        const { data: d4, error: e4 } = await supabase.rpc('get_france_live').limit(1);
        console.log(`   Result: Received ${d4?.length} rows in ${Date.now() - t4}ms. Error:`, e4);

    } catch (err) {
        console.error("Diagnostic failed:", err);
    }
}

diagnose();
