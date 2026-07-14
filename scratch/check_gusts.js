import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log("Checking recent hourly observations...");

    const { data, error } = await supabase
        .from('observations_horaire')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Recent hourly records:");
        console.log(data.map(d => ({
            station_id: d.station_id,
            timestamp: d.timestamp,
            ff: d.ff,
            fxi: d.fxi
        })));
        
        const withFxi = data.filter(d => d.fxi !== null);
        console.log(`Out of 10 recent records, ${withFxi.length} have non-null fxi.`);
    }
}
run();
