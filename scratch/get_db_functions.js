import pg from 'pg';
const { Client } = pg;

async function run() {
    console.log("Connecting via direct host on port 6543...");
    const client = new Client({
        host: 'db.ubdevaemtwbzxksjlhjg.supabase.co',
        port: 6543,
        user: 'postgres',
        password: 'Meteoclimatpro',
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Connected successfully!");

        // Query definition of get_france_live
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

        // Query definition of get_daily_extremes_fast
        const res2 = await client.query(`
            SELECT pg_get_functiondef(p.oid) as def
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = 'get_daily_extremes_fast';
        `);

        if (res2.rows.length > 0) {
            console.log("get_daily_extremes_fast definition:\n", res2.rows[0].def);
        }

    } catch (e) {
        console.error("Database error:", e);
    } finally {
        await client.end();
    }
}
run();
