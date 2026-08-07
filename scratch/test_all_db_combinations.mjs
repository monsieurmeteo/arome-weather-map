import pg from 'pg';
const { Client } = pg;

const passwords = [
    'Meteoclimatpro',
    'Agate59880',
    'Agate59880@@',
    'Agate59880@@@',
    'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR'
];

const hosts = [
    'aws-1-eu-west-1.pooler.supabase.com',
    'aws-0-eu-central-1.pooler.supabase.com'
];

const ports = [6543, 5432];

async function testAll() {
    for (const host of hosts) {
        for (const port of ports) {
            for (const pwd of passwords) {
                console.log(`Testing ${host}:${port} with password: ${pwd.substring(0, 15)}...`);
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
                    console.log(`\n🚀 🚀 SUCCESS! host=${host}, port=${port}, pwd=${pwd} works! 🚀 🚀\n`);
                    await client.end();
                    return;
                } catch (e) {
                    console.log(`❌ Failed: ${e.message.substring(0, 80)}`);
                    await client.end().catch(() => {});
                }
            }
        }
    }
    console.log('Done testing all combinations.');
}

testAll();
