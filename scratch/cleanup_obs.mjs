import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

console.log('\n🧹 Lancement du cleanup observations_6mn...\n');
const { data, error } = await sb.rpc('cleanup_observations_to_limit', { max_rows: 300000 });

if (error) {
    console.error('❌ Erreur:', error.message);
} else {
    const r = data?.[0];
    console.log('Résultat:');
    console.log('  Lignes avant :', Number(r?.rows_before).toLocaleString('fr-FR'));
    console.log('  Supprimées   :', Number(r?.rows_deleted).toLocaleString('fr-FR'));
    console.log('  Pivot        :', r?.pivot_timestamp);
    console.log('\n✅ Cleanup terminé!');
}
