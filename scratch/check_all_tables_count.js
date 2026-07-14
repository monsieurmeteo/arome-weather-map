import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    // We can't query pg_tables directly through PostgREST easily, but we can query known tables
    const tables = [
        'observations_6mn',
        'observations_horaire',
        'daily_summaries',
        'stations',
        'station_climatology',
        'lightning_strikes',
        'foudre_bilans',
        'bulletins'
    ];

    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
        
        console.log(`Table: ${table}, Row count: ${count}, Error:`, error?.message || 'None');
    }
}
run();
