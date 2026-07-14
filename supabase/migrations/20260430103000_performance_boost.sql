-- Migration d'optimisation de performance Supabase
-- Objectif : Supprimer les timeouts 504 et accélérer les requêtes

-- 1. Index sur les dates pour la table principale
CREATE INDEX IF NOT EXISTS idx_observations_6mn_timestamp_fast ON observations_6mn (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_observations_6mn_station_timestamp_fast ON observations_6mn (station_id, timestamp DESC);

-- 2. Index sur la table des résumés (utilisée par la carte)
CREATE INDEX IF NOT EXISTS idx_daily_summaries_date_fast ON daily_summaries (date DESC);

-- 3. Optimisation de la fonction de synchronisation
-- On remplace l'extraction de date (très lente) par une plage de timestamps (très rapide)
CREATE OR REPLACE FUNCTION batch_sync_daily_summaries(target_date date)
RETURNS void AS $$
DECLARE
    start_ts timestamp := target_date::timestamp AT TIME ZONE 'UTC';
    end_ts timestamp := (target_date + 1)::timestamp AT TIME ZONE 'UTC';
BEGIN
    INSERT INTO daily_summaries (station_id, date, temp_min, temp_max, wind_gust_max, wind_gust_time, rain_total, updated_at)
    SELECT 
        station_id, 
        target_date, 
        MIN(t), 
        MAX(t), 
        MAX(fxi), 
        (ARRAY_AGG(timestamp ORDER BY fxi DESC NULLS LAST))[1], 
        SUM(rr_per), 
        NOW()
    FROM observations_6mn
    WHERE timestamp >= start_ts AND timestamp < end_ts
    GROUP BY station_id
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

-- 4. Analyse des tables pour mettre à jour les statistiques de l'optimiseur
ANALYZE observations_6mn;
ANALYZE daily_summaries;
