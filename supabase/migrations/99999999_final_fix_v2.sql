-- ====================================================================
-- OPTIMISATION FINALE DE LA FONCTION DE SYNC
-- ====================================================================

-- On remplace l'égalité de date castée qui casse l'index par une vraie recherche sur une plage temporelle.
CREATE OR REPLACE FUNCTION batch_sync_daily_summaries(target_date date)
RETURNS void AS $$
DECLARE
    start_ts timestamptz := (target_date::timestamp AT TIME ZONE 'UTC');
    end_ts timestamptz := ((target_date + interval '1 day')::timestamp AT TIME ZONE 'UTC');
BEGIN
    INSERT INTO daily_summaries (station_id, date, temp_min, temp_max, wind_gust_max, wind_gust_time, rain_total, updated_at)
    SELECT 
        station_id, 
        target_date as d, 
        MIN(t), 
        MAX(t), 
        MAX(fxi), 
        (ARRAY_AGG(timestamp ORDER BY fxi DESC))[1], 
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
