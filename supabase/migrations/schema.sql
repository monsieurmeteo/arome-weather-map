-- Schema migration for Supabase Weather API Proxy

-- Enable gen_random_uuid() support
create extension if not exists "pgcrypto";

-- 1. Table for Client API Keys
create table if not exists public.api_keys (
    id uuid default gen_random_uuid() primary key,
    key text unique not null,
    name text not null,
    rate_limit_per_hour integer default 3600 not null,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast key searches
create index if not exists idx_api_keys_key on public.api_keys(key);

-- 2. Table for Weather Cache
create table if not exists public.weather_cache (
    id bigint generated always as identity primary key,
    lat_rounded numeric(5,2) not null,
    lon_rounded numeric(5,2) not null,
    endpoint text not null, -- 'forecast', 'current', 'hourly', 'daily', 'alerts'
    data jsonb not null,
    fetched_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(lat_rounded, lon_rounded, endpoint)
);

-- Index for cache lookups
create index if not exists idx_weather_cache_lookup 
on public.weather_cache(lat_rounded, lon_rounded, endpoint);

-- 3. Table for API Request Logs
create table if not exists public.api_logs (
    id bigint generated always as identity primary key,
    api_key_id uuid references public.api_keys(id) on delete set null,
    endpoint text not null,
    lat numeric(6,3),
    lon numeric(6,3),
    status_code integer not null,
    response_time_ms integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for rate limit counting and usage reporting
create index if not exists idx_api_logs_rate_limit 
on public.api_logs(api_key_id, created_at);

-- 4. High-performance PL/pgSQL function to validate API Key, check rate-limiting, and log atomically
create or replace function public.check_api_key_and_rate_limit(
    p_key text,
    p_endpoint text,
    p_lat numeric,
    p_lon numeric,
    p_response_time_ms integer,
    p_status_code integer
) returns jsonb as $$
declare
    v_key_id uuid;
    v_is_active boolean;
    v_rate_limit integer;
    v_req_count integer;
begin
    -- Find key details
    select id, is_active, rate_limit_per_hour
    into v_key_id, v_is_active, v_rate_limit
    from public.api_keys
    where key = p_key;

    if v_key_id is null then
        return jsonb_build_object('authorized', false, 'reason', 'Invalid API key');
    end if;

    if not v_is_active then
        return jsonb_build_object('authorized', false, 'reason', 'API key is inactive');
    end if;

    -- Count requests in the last hour
    select count(*)::integer
    into v_req_count
    from public.api_logs
    where api_key_id = v_key_id
      and created_at > now() - interval '1 hour';

    if v_req_count >= v_rate_limit then
        -- Log the rate-limited request
        insert into public.api_logs (api_key_id, endpoint, lat, lon, status_code, response_time_ms)
        values (v_key_id, p_endpoint, p_lat, p_lon, 429, p_response_time_ms);
        
        return jsonb_build_object('authorized', false, 'reason', 'Rate limit exceeded (' || v_rate_limit || '/hour)');
    end if;

    -- Log the successful request
    insert into public.api_logs (api_key_id, endpoint, lat, lon, status_code, response_time_ms)
    values (v_key_id, p_endpoint, p_lat, p_lon, p_status_code, p_response_time_ms);

    return jsonb_build_object('authorized', true);
end;
$$ language plpgsql security definer;

-- Insert a default master API Key for immediate testing and use
insert into public.api_keys (key, name, rate_limit_per_hour)
values ('weather-master-key-2026-cnews', 'CNEWS Weather Master', 5000)
on conflict (key) do nothing;
