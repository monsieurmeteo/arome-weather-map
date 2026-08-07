import pg from 'pg';
const { Client } = pg;

async function checkCronJobs() {
    const client = new Client({
        host: 'aws-1-eu-west-1.pooler.supabase.com',
        port: 5432,
        user: 'postgres',
        password: 'Meteoclimatpro',
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 30000,
    });

    try {
        await client.connect();
        console.log('✅ Connected to database!');

        console.log('\n--- Active Cron Jobs ---');
        const jobs = await client.query(`
            SELECT jobid, schedule, command, active, jobname
            FROM cron.job;
        `);
        console.table(jobs.rows);

        console.log('\n--- Recent Cron Job Run Details ---');
        const runs = await client.query(`
            SELECT jobid, runid, start_time, end_time, status, return_message
            FROM cron.job_run_details
            ORDER BY start_time DESC
            LIMIT 10;
        `);
        console.table(runs.rows);

        await client.end();
    } catch (e) {
        console.error('❌ Error:', e.message);
        await client.end();
    }
}

checkCronJobs();
