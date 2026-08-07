import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function run() {
    console.log('Querying cron.job via exec_sql RPC...');
    const { data: jobs, error: errJobs } = await supabase.rpc('exec_sql', {
        sql_query: `
            SELECT json_agg(t) FROM (
                SELECT jobid, schedule, command, active, jobname
                FROM cron.job
            ) t;
        `
    });

    if (errJobs) {
        console.error('❌ Error querying jobs:', errJobs);
    } else {
        console.log('✅ Cron Jobs:', jobs);
    }

    console.log('\nQuerying recent cron runs...');
    const { data: runs, error: errRuns } = await supabase.rpc('exec_sql', {
        sql_query: `
            SELECT json_agg(t) FROM (
                SELECT jobid, runid, start_time, end_time, status, return_message
                FROM cron.job_run_details
                ORDER BY start_time DESC
                LIMIT 10
            ) t;
        `
    });

    if (errRuns) {
        console.error('❌ Error querying runs:', errRuns);
    } else {
        console.log('✅ Recent Runs:', runs);
    }
}

run();
