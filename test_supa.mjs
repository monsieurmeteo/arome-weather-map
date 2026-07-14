import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    try {
        console.log("Fetching unique stations from observations_6mn table...");
        const { data, error } = await supabase
            .from('observations_6mn')
            .select('station_id')
            .limit(10);
            
        if (error) throw error;
        console.log("Observations sample:", data);
        
        console.log("\nFetching latest observations...");
        const { data: latestObs, error: err2 } = await supabase
            .from('observations_6mn')
            .select('*')
            .limit(1);
            
        if (err2) throw err2;
        console.log("Latest observations:", latestObs);
        
    } catch (e) {
        console.error("Error executing query:", e);
    }
}
main();
