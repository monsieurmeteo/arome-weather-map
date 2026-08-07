import pg from 'pg';
const { Client } = pg;

const SQL_COMMANDS = `
-- 1. DROP TRIGGER (Safe mode)
DROP TRIGGER IF EXISTS trg_sync_daily_summary ON observations_6mn;

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_observations_6mn_timestamp ON observations_6mn (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_observations_6mn_station_timestamp ON observations_6mn (station_id, timestamp DESC);

-- 3. Batch Sync Function
CREATE OR REPLACE FUNCTION batch_sync_daily_summaries(target_date date)
RETURNS void AS $$
BEGIN
    INSERT INTO daily_summaries (
        station_id, 
        date, 
        temp_min, 
        temp_max, 
        wind_gust_max, 
        wind_gust_time, 
        rain_total, 
        updated_at
    )
    SELECT 
        station_id,
        (timestamp AT TIME ZONE 'UTC')::date as d,
        MIN(t),
        MAX(t),
        MAX(fxi),
        (ARRAY_AGG(timestamp ORDER BY fxi DESC))[1],
        SUM(rr_per),
        NOW()
    FROM observations_6mn
    WHERE (timestamp AT TIME ZONE 'UTC')::date = target_date
    GROUP BY station_id, d
    ON CONFLICT (station_id, date) DO UPDATE 
    SET 
        temp_min = EXCLUDED.temp_min,
        temp_max = EXCLUDED.temp_max,
        wind_gust_max = EXCLUDED.wind_gust_max,
        wind_gust_time = EXCLUDED.wind_gust_time,
        rain_total = EXCLUDED.rain_total,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 4. Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('observations-archives', 'observations-archives', true)
ON CONFLICT (id) DO NOTHING;

-- Policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access') THEN
        CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'observations-archives');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service Role Access') THEN
        CREATE POLICY "Service Role Access" ON storage.objects FOR ALL USING (bucket_id = 'observations-archives') WITH CHECK (bucket_id = 'observations-archives');
    END IF;
END $$;
`;

async function applyEverything() {
    console.log('🚀 Connexion directe à la base de données...');
    const client = new Client({
        host: 'db.ubdevaemtwbzxksjlhjg.supabase.co',
        port: 6543,
        user: 'postgres',
        password: 'Meteoclimatpro',
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 30000,
    });

    try {
        await client.connect();
        process.stdout.write('🛠️ Application des commandes SQL... ');
        await client.query(SQL_COMMANDS);
        console.log('✅ TERMINÉ !');
        
        console.log('📊 Vérification de l\'état...');
        const res = await client.query('SELECT count(*) FROM observations_6mn');
        console.log(`Données actuelles en base : ${res.rows[0].count} lignes.`);
        
        await client.end();
    } catch (e) {
        console.error('❌ ERREUR :', e.message);
        await client.end();
    }
}

applyEverything();
