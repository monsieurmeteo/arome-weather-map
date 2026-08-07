import pg from 'pg';
const { Client } = pg;

const hosts = [
    'aws-1-eu-west-1.pooler.supabase.com'
];

const passwords = [
    'Agate59880@@',
    'Meteoclimatpro',
    'Agate59880@@@'
];

async function test() {
    for (const host of hosts) {
        for (const pwd of passwords) {
            for (const port of [5432, 6543]) {
                console.log(`Testing host: ${host}, port: ${port}, password: ${pwd}`);
                const client = new Client({
                    host: host,
                    port: port,
                    user: 'postgres.ubdevaemtwbzxksjlhjg',
                    password: pwd,
                    database: 'postgres',
                    ssl: { rejectUnauthorized: false },
                    connectionTimeoutMillis: 5000,
                });

                try {
                    await client.connect();
                    console.log(`🚀 SUCCESS! Host "${host}", port "${port}", password "${pwd}" works!`);
                    
                    const res = await client.query(`
                        SELECT pg_get_functiondef(p.oid) as def
                        FROM pg_proc p
                        JOIN pg_namespace n ON p.pronamespace = n.oid
                        WHERE n.nspname = 'public' AND p.proname = 'get_france_live';
                    `);

                    if (res.rows.length > 0) {
                        console.log("get_france_live definition:\n", res.rows[0].def);
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
