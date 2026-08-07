import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://ubdevaemtwbzxksjlhjg.supabase.co',
    'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR'
);

async function checkTables() {
    console.log('=== TABLES DISPONIBLES ===\n');

    // Vérifier les tables liées aux observations
    const tables = ['observations_6mn', 'daily_summaries', 'observations_horaires', 'station_hourly', 'hourly_obs'];
    
    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
        
        if (error) {
            console.log(`${table}: ❌ N'existe pas (${error.message})`);
        } else {
            console.log(`${table}: ✅ Existe — ${count} lignes`);
        }
    }

    // Vérifier ce que batch_sync_daily_summaries produit
    console.log('\n=== STRUCTURE daily_summaries ===');
    const { data } = await supabase
        .from('daily_summaries')
        .select('*')
        .limit(1);
    if (data?.[0]) {
        console.log('Colonnes:', Object.keys(data[0]).join(', '));
    }
}

checkTables();
