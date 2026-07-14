import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
    const r6 = await supabase.from('observations_6mn').select('timestamp').eq('station_id', '02173002').order('timestamp', { ascending: false }).limit(10);
    const rh = await supabase.from('observations_horaire').select('timestamp').eq('station_id', '02173002').order('timestamp', { ascending: false }).limit(10);

    fs.writeFileSync('db_chauny_timestamps.json', JSON.stringify({ r6: r6.data, rh: rh.data }, null, 2));
}
main();
