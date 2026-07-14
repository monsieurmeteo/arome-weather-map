import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

const tables = [
    'observations_6mn','daily_summaries','stations','vigilance_data',
    'vigilance_status','vigilance_bulletins','lightning_strikes','foudre_bilans',
    'bulletins','web_links','btp_projects','btp_config','btp_hours',
    'attestations_intemperies','certificats_meteo','user_alerts',
    'user_station_configs','station_climatology','observations_horaire',
    'station_metadata','btp_intemperiences'
];

console.log('\nVérification des tables Supabase:\n');
const existing = [];
const missing = [];

for (const t of tables) {
    const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true });
    if (!error) {
        console.log(`  ✅ ${t.padEnd(30)} → ${count} lignes`);
        existing.push(t);
    } else {
        console.log(`  ❌ ${t.padEnd(30)} → INEXISTANTE`);
        missing.push(t);
    }
}

console.log('\n--- Résumé ---');
console.log('Tables existantes:', existing.join(', '));
console.log('Tables manquantes:', missing.join(', '));
