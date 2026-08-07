import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const y = yesterday.getFullYear();
const m = String(yesterday.getMonth() + 1).padStart(2, '0');
const d = String(yesterday.getDate()).padStart(2, '0');

const j2 = new Date(yesterday);
j2.setDate(j2.getDate() - 1);
const y2 = j2.getFullYear();
const m2 = String(j2.getMonth() + 1).padStart(2, '0');
const d2 = String(j2.getDate()).padStart(2, '0');

console.log('\n📁 Vérification des archives Supabase Storage\n');

async function check(label, path) {
    const t = Date.now();
    const { data, error } = await sb.storage.from('observations-archives').download(path);
    const elapsed = Date.now() - t;
    if (error) {
        console.log(`  ❌ ${label.padEnd(40)} ABSENT (${elapsed}ms) — ${error.message}`);
        return false;
    } else {
        const text = await data.text();
        let count = 0;
        try { count = JSON.parse(text).length; } catch(e) {}
        console.log(`  ✅ ${label.padEnd(40)} OK — ${count} obs — ${elapsed}ms`);
        return true;
    }
}

console.log(`📅 J-1 (${y}-${m}-${d}) :`);
const unified = await check('Fichier unifié', `6mn/${y}/${m}/${d}.json`);
if (!unified) {
    await check('Slice 00-06', `6mn/${y}/${m}/${d}/00-06.json`);
    await check('Slice 06-12', `6mn/${y}/${m}/${d}/06-12.json`);
    await check('Slice 12-18', `6mn/${y}/${m}/${d}/12-18.json`);
    await check('Slice 18-00', `6mn/${y}/${m}/${d}/18-00.json`);
}

console.log(`\n📅 J-2 (${y2}-${m2}-${d2}) :`);
const unified2 = await check('Fichier unifié', `6mn/${y2}/${m2}/${d2}.json`);
if (!unified2) {
    await check('Slice 00-06', `6mn/${y2}/${m2}/${d2}/00-06.json`);
    await check('Slice 06-12', `6mn/${y2}/${m2}/${d2}/06-12.json`);
    await check('Slice 12-18', `6mn/${y2}/${m2}/${d2}/12-18.json`);
    await check('Slice 18-00', `6mn/${y2}/${m2}/${d2}/18-00.json`);
}

console.log('\n📂 Liste des derniers fichiers dans le bucket:');
const { data: files } = await sb.storage.from('observations-archives').list('6mn', { limit: 10, sortBy: { column: 'name', order: 'desc' } });
(files || []).forEach(f => console.log(`  • ${f.name}`));
