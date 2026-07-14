import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const content = fs.readFileSync('.env.local', 'utf8');
const url = content.match(/VITE_SUPABASE_URL="(.*?)"/)[1];
const key = content.match(/VITE_SUPABASE_ANON_KEY="(.*?)"/)[1];

const supabase = createClient(url, key);

const { data, error } = await supabase.from('vigilance_status').select('*').eq('period', 0);
if (error) {
    console.error(error);
} else {
    console.log("Total rows for period 0:", data.length);
    const redDeps = data.filter(d => d.risks?.some(r => r.id === "100" && r.level === 4));
    console.log("Red departments (level 4) for phenom 100:", redDeps.map(d => ({ dep: d.dep_code, risks: d.risks.find(r => r.id === "100") })));
    
    const dep66 = data.find(d => d.dep_code === '66');
    console.log("Dep 66 details:", JSON.stringify(dep66, null, 2));
}
