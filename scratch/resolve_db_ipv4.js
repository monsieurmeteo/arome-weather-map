import dns from 'dns';
import pg from 'pg';
const { Client } = pg;

dns.resolve4('db.ubdevaemtwbzxksjlhjg.supabase.co', async (err, addresses) => {
    if (err) {
        console.error("DNS resolution error:", err);
        return;
    }

    console.log("IPv4 addresses resolved:", addresses);
    const ip = addresses[0];
    console.log("Using IP:", ip);

    const passwords = ["Meteoclimatpro", "Agate59880@@"];
    for (const pwd of passwords) {
        for (const port of [5432, 6543]) {
            console.log(`Trying IP: ${ip}, Port: ${port}, Pwd: ${pwd}...`);
            const client = new Client({
                host: ip,
                port: port,
                user: 'postgres',
                password: pwd,
                database: 'postgres',
                ssl: { rejectUnauthorized: false },
                connectionTimeoutMillis: 5000,
            });

            try {
                await client.connect();
                console.log("🚀 SUCCESS! Connected to Postgres!");
                
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
});
