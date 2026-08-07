import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function importChaunyOnly() {
    console.log("Importing Chauny data only...");
    const csvContent = fs.readFileSync('meteo_cleaned.csv', 'utf8');
    const lines = csvContent.split('\n');
    const header = lines[0].split(';').map(h => h.trim());

    const records = [];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].startsWith('2173002;')) {
            const vals = lines[i].split(';');
            const r = {};
            header.forEach((h, idx) => r[h] = vals[idx]?.trim() || '');
            records.push({
                station_id: '02173002',
                date: r.DATE,
                rain_total: r.RR === '' ? null : parseFloat(r.RR.replace(',', '.')),
                temp_min: r.TN === '' ? null : parseFloat(r.TN.replace(',', '.')),
                temp_max: r.TX === '' ? null : parseFloat(r.TX.replace(',', '.')),
                wind_gust_max: r.FXI === '' ? null : parseFloat(r.FXI.replace(',', '.')),
                updated_at: new Date().toISOString()
            });
        }
    }

    console.log(`Ready to upsert ${records.length} records for Chauny.`);
    const { error } = await supabase.from('daily_summaries').upsert(records, { onConflict: 'station_id,date' });
    if (error) console.error("Error:", error);
    else console.log("Success for Chauny!");
}

importChaunyOnly();
