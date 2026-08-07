import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase
        .from('observations_6mn')
        .select('station_id, timestamp, t, u, ff')
        .in('station_id', ['59580003', '02173002'])
        .order('timestamp', { ascending: false })
        .limit(10);

    if (error) { console.error(error); return; }

    let out = "=== SUPABASE RECENT DATA FOR STEENVOORDE & CHAUNY ===\n";
    data.forEach(d => { out += `${d.station_id} | ${d.timestamp} | T:${d.t} U:${d.u} V:${d.ff}\n`; });

    const h4 = new Date(Date.now() - 3600 * 1000 * 4).toISOString();

    const countRes = await supabase
        .from('observations_6mn')
        .select('station_id', { count: 'exact', head: true })
        .in('station_id', ['59580003', '02173002'])
        .gte('timestamp', h4);

    out += `\nRecords past 4 hours: ${countRes.count}\n`;
    fs.writeFileSync('output_supabase.json', out, 'utf-8');
}

check();
