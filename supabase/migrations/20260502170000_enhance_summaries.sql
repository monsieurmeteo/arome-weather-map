
-- 1. Ajout des colonnes manquantes dans observations_6mn
ALTER TABLE observations_6mn ADD COLUMN IF NOT EXISTS insolh float;
ALTER TABLE observations_6mn ADD COLUMN IF NOT EXISTS ht_neige float;

-- 2. Ajout des colonnes dans daily_summaries
ALTER TABLE daily_summaries ADD COLUMN IF NOT EXISTS sun_total float;
ALTER TABLE daily_summaries ADD COLUMN IF NOT EXISTS snow_depth float;
ALTER TABLE daily_summaries ADD COLUMN IF NOT EXISTS hum_avg float;
ALTER TABLE daily_summaries ADD COLUMN IF NOT EXISTS pres_min float;
ALTER TABLE daily_summaries ADD COLUMN IF NOT EXISTS pres_max float;

-- 3. Optimisation et mise à jour de la fonction de synchronisation
CREATE OR REPLACE FUNCTION batch_sync_daily_summaries(target_date date)
RETURNS void AS $$
DECLARE
    start_ts timestamptz := (target_date::timestamp AT TIME ZONE 'UTC');
    end_ts timestamptz := ((target_date + interval '1 day')::timestamp AT TIME ZONE 'UTC');
BEGIN
    INSERT INTO daily_summaries (
        station_id, date, temp_min, temp_max, 
        wind_gust_max, wind_gust_time, rain_total, 
        sun_total, snow_depth, hum_avg, pres_min, pres_max,
        updated_at
    )
    SELECT 
        station_id, 
        target_date, 
        MIN(t), 
        MAX(t), 
        MAX(fxi), 
        (ARRAY_AGG(timestamp ORDER BY fxi DESC NULLS LAST))[1], 
        SUM(rr_per),
        SUM(insolh),
        MAX(ht_neige),
        AVG(u),
        MIN(pres),
        MAX(pres),
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
        sun_total = EXCLUDED.sun_total,
        snow_depth = EXCLUDED.snow_depth,
        hum_avg = EXCLUDED.hum_avg,
        pres_min = EXCLUDED.pres_min,
        pres_max = EXCLUDED.pres_max,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 4. Mise à jour du trigger temps réel
CREATE OR REPLACE FUNCTION sync_daily_summary()
RETURNS TRIGGER AS $$
DECLARE
    v_date date;
BEGIN
    v_date := (NEW.timestamp AT TIME ZONE 'UTC')::date;

    INSERT INTO daily_summaries (
        station_id, date, temp_min, temp_max, 
        wind_gust_max, wind_gust_time, rain_total,
        sun_total, snow_depth, hum_avg, pres_min, pres_max,
        updated_at
    )
    VALUES (
        NEW.station_id, v_date, NEW.t, NEW.t, 
        NEW.fxi, NEW.timestamp, COALESCE(NEW.rr_per, 0),
        COALESCE(NEW.insolh, 0), NEW.ht_neige, NEW.u, NEW.pres, NEW.pres,
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
        rain_total = daily_summaries.rain_total + EXCLUDED.rain_total,
        sun_total = COALESCE(daily_summaries.sun_total, 0) + EXCLUDED.sun_total,
        snow_depth = GREATEST(daily_summaries.snow_depth, EXCLUDED.snow_depth),
        hum_avg = (COALESCE(daily_summaries.hum_avg, EXCLUDED.hum_avg) + EXCLUDED.hum_avg) / 2, -- Approximation simple
        pres_min = LEAST(daily_summaries.pres_min, EXCLUDED.pres_min),
        pres_max = GREATEST(daily_summaries.pres_max, EXCLUDED.pres_max),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Optimisation des RPCs pour éviter les timeouts
-- On utilise une jointure plus efficace et on s'assure que les index sont utilisés
CREATE OR REPLACE FUNCTION get_daily_extremes_fast(target_date date, dept_codes text[] DEFAULT '{}'::text[])
RETURNS TABLE(
    station_id character varying,
    station_name character varying,
    lat numeric,
    lon numeric,
    temp_min numeric,
    temp_max numeric,
    wind_gust_max numeric,
    wind_gust_time timestamp with time zone,
    rain_total numeric,
    sun_total numeric,
    snow_depth numeric,
    hum_avg numeric,
    pres_min numeric,
    pres_max numeric
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ds.station_id,
        st.name AS station_name,
        st.lat,
        st.lon,
        ds.temp_min::numeric,
        ds.temp_max::numeric,
        ds.wind_gust_max::numeric,
        ds.wind_gust_time,
        ds.rain_total::numeric,
        ds.sun_total::numeric,
        ds.snow_depth::numeric,
        ds.hum_avg::numeric,
        ds.pres_min::numeric,
        ds.pres_max::numeric
    FROM daily_summaries ds
    JOIN stations st ON ds.station_id = st.id
    WHERE ds.date = target_date
    AND (array_length(dept_codes, 1) IS NULL OR substring(ds.station_id FROM 1 FOR 2) = ANY(dept_codes));
END;
$$;

CREATE OR REPLACE FUNCTION get_daily_extremes_full(target_date date)
RETURNS TABLE (
    station_id character varying,
    station_name character varying,
    lat numeric,
    lon numeric,
    temp_min numeric,
    temp_max numeric,
    wind_gust_max numeric,
    wind_gust_time timestamp with time zone,
    rain_total numeric,
    sun_total numeric,
    snow_depth numeric,
    hum_avg numeric,
    pres_min numeric,
    pres_max numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ds.station_id,
        st.name AS station_name,
        st.lat,
        st.lon,
        ds.temp_min::numeric,
        ds.temp_max::numeric,
        ds.wind_gust_max::numeric,
        ds.wind_gust_time,
        ds.rain_total::numeric,
        ds.sun_total::numeric,
        ds.snow_depth::numeric,
        ds.hum_avg::numeric,
        ds.pres_min::numeric,
        ds.pres_max::numeric
    FROM daily_summaries ds
    JOIN stations st ON ds.station_id = st.id
    WHERE ds.date = target_date;
END;
$$;

-- 6. Maintenance
ANALYZE observations_6mn;
ANALYZE daily_summaries;
ANALYZE stations;
