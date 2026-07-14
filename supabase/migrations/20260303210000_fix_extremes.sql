
-- 1. Réparation des données pour Lille (70 km/h le 15 fév @ 23:06 UTC)
UPDATE daily_summaries 
SET wind_gust_max = 70, 
    wind_gust_time = '2026-02-15 23:06:00+00',
    updated_at = NOW()
WHERE station_id = '59343001' 
  AND (date = '2026-02-15' OR date = '2026-02-16')
  AND (wind_gust_max < 70 OR wind_gust_max IS NULL);

-- 2. Création du TRIGGER pour l'automatisation future
-- Cette fonction sera appelée à chaque insertion de données 6 minutes
CREATE OR REPLACE FUNCTION sync_daily_summary()
RETURNS TRIGGER AS $$
DECLARE
    v_date date;
BEGIN
    -- On utilise la date UTC du relevé
    v_date := (NEW.timestamp AT TIME ZONE 'UTC')::date;

    -- Upsert dans daily_summaries
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
    VALUES (
        NEW.station_id, 
        v_date, 
        NEW.t, 
        NEW.t, 
        NEW.fxi, 
        NEW.timestamp,
        COALESCE(NEW.rr_per, 0),
        NOW()
    )
    ON CONFLICT (station_id, date) DO UPDATE 
    SET 
        temp_min = LEAST(daily_summaries.temp_min, EXCLUDED.temp_min),
        temp_max = GREATEST(daily_summaries.temp_max, EXCLUDED.temp_max),
        wind_gust_max = GREATEST(daily_summaries.wind_gust_max, EXCLUDED.wind_gust_max),
        wind_gust_time = CASE 
            WHEN EXCLUDED.wind_gust_max >= COALESCE(daily_summaries.wind_gust_max, 0) THEN EXCLUDED.wind_gust_time 
            ELSE daily_summaries.wind_gust_time 
        END,
        -- On ne somme pas la pluie ici car rr_per peut être un cumul glissant
        -- On laisse une autre tâche s'en occuper ou on l'ajoute si on est sûr que rr_per = cumul 6mn
        updated_at = NOW()
    WHERE daily_summaries.station_id = EXCLUDED.station_id AND daily_summaries.date = EXCLUDED.date;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Application du trigger sur la table des observations
DROP TRIGGER IF EXISTS trg_sync_daily_summary ON observations_6mn;
CREATE TRIGGER trg_sync_daily_summary
AFTER INSERT ON observations_6mn
FOR EACH ROW
EXECUTE FUNCTION sync_daily_summary();
