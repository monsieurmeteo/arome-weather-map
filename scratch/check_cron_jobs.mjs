import pg from 'pg';
const { Client } = pg;

async function checkCron() {
    console.log('Connecting to database...');
    const client = new Client({
        host: 'db.ubdevaemtwbzxksjlhjg.supabase.co',
        port: 5432,
        user: 'postgres',
        password: 'Meteoclimatpro',
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log('\n--- CRON JOBS ---');
        const resJobs = await client.query('SELECT jobid, schedule, command, nodename, nodeport, database, username, active, jobname FROM cron.job;');
        console.table(resJobs.rows);

        console.log('\n--- RECENT CRON RUNS ---');
        const resRuns = await client.query('SELECT runid, jobid, jobname, status, return_message, start_time, end_time FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;');
        console.table(resRuns.rows);

        await client.end();
    } catch (e) {
        console.error('Error:', e.message);
        client.end();
    }
}

checkCron();
