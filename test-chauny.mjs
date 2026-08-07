import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    console.log("Fetching data for Chauny (02173002)");
    const min6Data = await supabase.from('observations_6mn').select('timestamp, t, ff, rr_per').eq('station_id', '02173002').order('timestamp', { ascending: false }).limit(5);

    const hData = await supabase.from('observations_horaire').select('timestamp, t, ff, rr1').eq('station_id', '02173002').order('timestamp', { ascending: false }).limit(5);

    fs.writeFileSync('chauny-result.json', JSON.stringify({
        min6: min6Data.data,
        hour: hData.data
    }, null, 2));
    console.log("Done");
}
main();
