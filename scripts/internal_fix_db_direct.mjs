import pg from 'pg';
const { Client } = pg;

async function applyEverything() {
    console.log('🚀 Connexion directe (Port 5432)...');
    const client = new Client({
        host: 'db.ubdevaemtwbzxksjlhjg.supabase.co',
        port: 5432,
        user: 'postgres',
        password: 'Meteoclimatpro',
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 30000,
    });

    try {
        await client.connect();
        console.log('✅ Connecté !');
        // ... (remaining code same as before)
        await client.query(`
            DROP TRIGGER IF EXISTS trg_sync_daily_summary ON observations_6mn;
            CREATE INDEX IF NOT EXISTS idx_observations_6mn_timestamp ON observations_6mn (timestamp DESC);
            CREATE INDEX IF NOT EXISTS idx_observations_6mn_station_timestamp ON observations_6mn (station_id, timestamp DESC);
        `);
        console.log('✅ SQL appliqué.');
        await client.end();
    } catch (e) {
        console.error('❌ ERREUR :', e.message);
        await client.end();
    }
}

applyEverything();
