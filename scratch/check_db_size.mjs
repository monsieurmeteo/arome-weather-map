import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function run() {
    console.log("--- Supabase Database Size Audit ---");
    
    // 1. Get total database size
    const { data: dbSize, error: errDbSize } = await supabase.rpc('exec_sql', {
        sql_query: `
            SELECT json_agg(t) FROM (
                SELECT pg_size_pretty(pg_database_size(current_database())) AS total_db_size
            ) t;
        `
    });

    if (errDbSize) {
        console.error('❌ Error querying database size:', errDbSize);
    } else {
        console.log('✅ Total Database Size:', dbSize?.[0]?.total_db_size);
    }

    // 2. Get table sizes
    const { data: tableSizes, error: errTableSizes } = await supabase.rpc('exec_sql', {
        sql_query: `
            SELECT json_agg(t) FROM (
                SELECT
                    schemaname AS schema,
                    relname AS table_name,
                    n_live_tup AS row_count,
                    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
                    pg_size_pretty(pg_relation_size(relid)) AS table_size,
                    pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size
                FROM pg_stat_user_tables
                JOIN pg_catalog.pg_statio_user_tables USING (schemaname, relname)
                ORDER BY pg_total_relation_size(relid) DESC
            ) t;
        `
    });

    if (errTableSizes) {
        console.error('❌ Error querying table sizes:', errTableSizes);
    } else {
        console.log('\n✅ Table Breakdown:');
        console.table(tableSizes);
    }
}

run();
