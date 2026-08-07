import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function run() {
    console.log("--- Supabase Table Row Counts ---");

    const tables = ['observations_6mn', 'daily_summaries', 'stations', 'station_history', 'normals_1991_2020'];

    for (const table of tables) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                console.log(`Table '${table}': ERROR (${error.message})`);
            } else {
                console.log(`Table '${table}': ${count} rows`);
            }
        } catch (e) {
            console.log(`Table '${table}': Exception (${e.message})`);
        }
    }
}

run();
