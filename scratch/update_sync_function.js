import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function run() {
    console.log("Updating batch_sync_daily_summaries SQL function...");

    const sql = `
CREATE OR REPLACE FUNCTION batch_sync_daily_summaries(target_date date)
RETURNS void AS $$
DECLARE
    start_ts timestamptz := (target_date::timestamp AT TIME ZONE 'UTC');
    end_ts timestamptz := ((target_date + interval '1 day')::timestamp AT TIME ZONE 'UTC');
BEGIN
    -- 1. Insert/update using 6mn data
    INSERT INTO daily_summaries (station_id, date, temp_min, temp_max, wind_gust_max, wind_gust_time, rain_total, updated_at)
    SELECT 
        station_id, 
        target_date as d, 
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

    -- 2. Update with hourly wind gusts if they exist and are greater (useful since June 17 2026 where 6mn gusts are null)
    WITH hourly_max AS (
        SELECT 
            station_id,
            MAX(fxi) as max_gust,
            (ARRAY_AGG(timestamp ORDER BY fxi DESC NULLS LAST))[1] as max_gust_time
        FROM observations_horaire
        WHERE timestamp >= start_ts AND timestamp < end_ts AND fxi IS NOT NULL
        GROUP BY station_id
    )
    UPDATE daily_summaries ds
    SET 
        wind_gust_max = GREATEST(COALESCE(ds.wind_gust_max, 0), hm.max_gust),
        wind_gust_time = CASE 
            WHEN hm.max_gust >= COALESCE(ds.wind_gust_max, 0) THEN hm.max_gust_time
            ELSE ds.wind_gust_time
        END
    FROM hourly_max hm
    WHERE ds.station_id = hm.station_id AND ds.date = target_date;
END;
$$ LANGUAGE plpgsql;
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
        console.error("❌ Error updating function:", error);
    } else {
        console.log("✅ SQL Function updated successfully!");
    }
}

run();
