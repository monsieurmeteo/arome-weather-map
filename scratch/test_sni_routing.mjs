import pg from 'pg';
const { Client } = pg;

const passwords = ['Meteoclimatpro', 'Agate59880@@'];
// IPv4 of aws-1-eu-west-1.pooler.supabase.com
const poolerIps = ['18.202.64.2', '54.247.26.119', '54.229.189.117'];

async function testSni() {
    for (const ip of poolerIps) {
        for (const pwd of passwords) {
            console.log(`Testing SNI route with IP: ${ip}, pwd: ${pwd}...`);
            const client = new Client({
                host: ip,
                port: 6543,
                user: 'postgres',
                password: pwd,
                database: 'postgres',
                ssl: {
                    servername: 'db.ubdevaemtwbzxksjlhjg.supabase.co',
                    rejectUnauthorized: false
                },
                connectionTimeoutMillis: 5000,
            });

            try {
                await client.connect();
                console.log(`\n🚀 🚀 SUCCESS! host=${ip}, pwd=${pwd} works via SNI! 🚀 🚀\n`);
                await client.end();
                return;
            } catch (e) {
                console.log(`❌ Failed: ${e.message}`);
                await client.end().catch(() => {});
            }
        }
    }
}

testSni();
