-- Fonction pour agréger les données de daily_summaries en BATCH
-- Plutôt qu'un trigger ligne par ligne, on lance cette fonction périodiquement (ex: 1h)

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
        (ARRAY_AGG(timestamp ORDER BY fxi DESC))[1], -- Heure de la rafale max
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
