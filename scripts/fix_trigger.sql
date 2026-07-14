-- Fix for the sync_daily_summary trigger to avoid NULL corruption
CREATE OR REPLACE FUNCTION sync_daily_summary()
RETURNS TRIGGER AS $$
DECLARE
    v_date date;
BEGIN
    -- Use UTC date
    v_date := (NEW.timestamp AT TIME ZONE 'UTC')::date;

    -- Upsert with NULL protection
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
        temp_min = LEAST(daily_summaries.temp_min, COALESCE(EXCLUDED.temp_min, daily_summaries.temp_min)),
        temp_max = GREATEST(daily_summaries.temp_max, COALESCE(EXCLUDED.temp_max, daily_summaries.temp_max)),
        wind_gust_max = GREATEST(daily_summaries.wind_gust_max, COALESCE(EXCLUDED.wind_gust_max, daily_summaries.wind_gust_max)),
        wind_gust_time = CASE 
            WHEN EXCLUDED.wind_gust_max IS NOT NULL AND EXCLUDED.wind_gust_max >= COALESCE(daily_summaries.wind_gust_max, 0) THEN EXCLUDED.wind_gust_time 
            ELSE daily_summaries.wind_gust_time 
        END,
        updated_at = NOW()
    WHERE daily_summaries.station_id = EXCLUDED.station_id AND daily_summaries.date = EXCLUDED.date;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
