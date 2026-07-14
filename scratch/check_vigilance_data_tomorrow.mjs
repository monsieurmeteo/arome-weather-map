import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const content = fs.readFileSync('.env.local', 'utf8');
const url = content.match(/VITE_SUPABASE_URL="(.*?)"/)[1];
const key = content.match(/VITE_SUPABASE_ANON_KEY="(.*?)"/)[1];

const supabase = createClient(url, key);

const { data, error } = await supabase.from('vigilance_status').select('*').eq('period', 1);
if (error) {
    console.error(error);
} else {
    console.log("Total rows for period 1:", data.length);
    const forestRows = data.filter(d => d.risks?.some(r => r.id === "100"));
    console.log("Rows with risk 100 for tomorrow:", forestRows.length);
    if (forestRows.length > 0) {
        console.log("Sample forest row tomorrow:", JSON.stringify(forestRows[0], null, 2));
    }
}
