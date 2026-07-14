import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const min6Data = await supabase.from('observations_6mn').select('timestamp, station_id').order('timestamp', { ascending: false }).limit(1);
    const hData = await supabase.from('observations_horaire').select('timestamp, station_id').order('timestamp', { ascending: false }).limit(1);

    fs.writeFileSync('latest-result.json', JSON.stringify({
        LATEST_6MN_ANY: min6Data.data,
        LATEST_1H_ANY: hData.data
    }, null, 2));
}
main();
