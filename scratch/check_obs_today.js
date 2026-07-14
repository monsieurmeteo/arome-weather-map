import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const todayStr = '2026-07-02';
    console.log("Checking observations for station 59343001 (Lille) on date:", todayStr);

    const { data, error } = await supabase
        .from('observations_6mn')
        .select('*')
        .eq('station_id', '59343001')
        .gte('timestamp', todayStr + 'T00:00:00Z')
        .lte('timestamp', todayStr + 'T23:59:59Z')
        .order('timestamp', { ascending: false });

    if (error) {
        console.error("Error:", error);
    } else {
        console.log(`Found ${data.length} records.`);
        console.log("Sample records:");
        console.log(data.slice(0, 5));
        
        // Count non-null fxi values
        const nonNullFxi = data.filter(d => d.fxi !== null);
        console.log(`Number of records with non-null fxi: ${nonNullFxi.length}`);
    }
}
run();
