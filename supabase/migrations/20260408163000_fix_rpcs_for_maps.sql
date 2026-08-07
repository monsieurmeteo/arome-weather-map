-- Migration pour faire pointer get_daily_extremes_fast sur la nouvelle table daily_summaries
-- Ce qui rétablit les cartes journalières et historiques !

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
    rain_total numeric
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
        ds.temp_min,
        ds.temp_max,
        ds.wind_gust_max,
        ds.wind_gust_time,
        ds.rain_total
    FROM daily_summaries ds
    LEFT JOIN stations st ON ds.station_id = st.id
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
    rain_total numeric
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
        ds.temp_min,
        ds.temp_max,
        ds.wind_gust_max,
        ds.wind_gust_time,
        ds.rain_total
    FROM daily_summaries ds
    LEFT JOIN stations st ON ds.station_id = st.id
    WHERE ds.date = target_date;
END;
$$;
