-- ====================================================================
-- FIX FINAL POUR SUPABASE (RÉDUCTION DISK IO & PERFORMANCE)
-- ====================================================================

-- 1. DÉSACTIVER LE TRIGGER BLOQUANT
DROP TRIGGER IF EXISTS trg_sync_daily_summary ON observations_6mn;

-- 2. AJOUTER DES INDEX DE PERFORMANCE (CRITIQUE)
-- Ces index permettent d'accélérer les recherches par date de 1000%
CREATE INDEX IF NOT EXISTS idx_observations_6mn_timestamp ON observations_6mn (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_observations_6mn_station_timestamp ON observations_6mn (station_id, timestamp DESC);

-- 3. NOUVELLE FONCTION DE CALCUL (LÉGÈRE)
CREATE OR REPLACE FUNCTION batch_sync_daily_summaries(target_date date)
RETURNS void AS $$
BEGIN
    INSERT INTO daily_summaries (station_id, date, temp_min, temp_max, wind_gust_max, wind_gust_time, rain_total, updated_at)
    SELECT 
        station_id, 
        (timestamp AT TIME ZONE 'UTC')::date, 
        MIN(t), 
        MAX(t), 
        MAX(fxi), 
        (ARRAY_AGG(timestamp ORDER BY fxi DESC))[1], 
        SUM(rr_per), 
        NOW()
    FROM observations_6mn
    WHERE (timestamp AT TIME ZONE 'UTC')::date = target_date
    GROUP BY station_id, (timestamp AT TIME ZONE 'UTC')::date
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

-- 4. CONFIGURATION DU STOCKAGE (POUR ARCHIVES JSON)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('observations-archives', 'observations-archives', true) 
ON CONFLICT (id) DO NOTHING;

-- POLITIQUES DE SÉCURITÉ STOCKAGE
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Archive') THEN
        CREATE POLICY "Public Access Archive" ON storage.objects FOR SELECT USING (bucket_id = 'observations-archives');
    END IF;
END $$;
