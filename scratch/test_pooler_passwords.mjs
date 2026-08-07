import pg from 'pg';
const { Client } = pg;

const hosts = [
    'aws-0-eu-central-1.pooler.supabase.com',
    'aws-1-eu-west-1.pooler.supabase.com',
    'db.ubdevaemtwbzxksjlhjg.supabase.co'
];

const passwords = [
    'Agate59880@@',
    'Meteoclimatpro',
];

async function test() {
    for (const host of hosts) {
        for (const pwd of passwords) {
            for (const port of [5432, 6543]) {
                const user = host.includes('pooler') ? 'postgres.ubdevaemtwbzxksjlhjg' : 'postgres';
                console.log(`Testing host: ${host}, port: ${port}, user: ${user}, pwd: ${pwd}...`);
                const client = new Client({
                    host: host,
                    port: port,
                    user: user,
                    password: pwd,
                    database: 'postgres',
                    ssl: { rejectUnauthorized: false },
                    connectionTimeoutMillis: 5000,
                });

                try {
                    await client.connect();
                    console.log(`🚀 SUCCESS! Connection works!`);
                    console.log(`Host: ${host}, Port: ${port}, User: ${user}, Pwd: ${pwd}`);
                    
                    // Query function definitions
                    const res = await client.query(`
                        SELECT pg_get_functiondef(p.oid) as def
                        FROM pg_proc p
                        JOIN pg_namespace n ON p.pronamespace = n.oid
                        WHERE n.nspname = 'public' AND p.proname = 'get_france_live';
                    `);

                    if (res.rows.length > 0) {
                        console.log("get_france_live definition:\n", res.rows[0].def);
                    } else {
                        console.log("get_france_live function not found.");
                    }
                    
                    await client.end();
                    return;
                } catch (e) {
                    console.log(`❌ Failed: ${e.message}`);
                    await client.end().catch(() => {});
                }
            }
        }
    }
}

test();
