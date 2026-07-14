import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

const METEO_KEY = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const METEO_SECRET = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

async function getOrRefreshToken(force = false) {
    if (!force) {
        const { data: secrets } = await supabase
            .from('api_secrets')
            .select('access_token')
            .eq('provider', 'meteo_france')
            .single();
        
        if (secrets?.access_token) {
            return secrets.access_token;
        }
    }
    
    console.log("Refreshing Token...");
    const auth = btoa(`${METEO_KEY}:${METEO_SECRET}`);
    const res = await fetch('https://portail-api.meteofrance.fr/token', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials'
    });
    const data = await res.json();
    const token = data.access_token;
    await supabase.from('api_secrets').upsert({ provider: 'meteo_france', access_token: token, updated_at: new Date().toISOString() });
    return token;
}

async function run() {
    console.log("Starting hourly backfill from June 17, 2026 to today...");
    let token = await getOrRefreshToken();

    const start = new Date(Date.now() - 24 * 60 * 60 * 1000);
    start.setMinutes(0, 0, 0);
    const end = new Date(); // today
    end.setMinutes(0, 0, 0);

    let current = new Date(start);
    const hoursToFetch = [];
    while (current <= end) {
        hoursToFetch.push(new Date(current));
        current = new Date(current.getTime() + 60 * 60 * 1000);
    }

    console.log(`Total hours to backfill: ${hoursToFetch.length}`);

    for (let i = 0; i < hoursToFetch.length; i++) {
        const slot = hoursToFetch[i];
        const dateStr = slot.toISOString().split('.')[0] + 'Z';
        console.log(`[${i + 1}/${hoursToFetch.length}] Processing ${dateStr}...`);

        try {
            // Check if already in DB
            const { count } = await supabase
                .from('observations_horaire')
                .select('*', { count: 'exact', head: true })
                .eq('timestamp', dateStr);

            if (count > 0) {
                console.log(`  Already has ${count} records in DB. Skipping.`);
                continue;
            }

            // Fetch
            const url = `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/horaire?date=${dateStr}&format=json`;
            let res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.status === 401) {
                token = await getOrRefreshToken(true); // Force refresh
                res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            }

            if (res.status === 429) {
                console.log("  Rate limited! Sleeping 10 seconds...");
                await new Promise(r => setTimeout(r, 10000));
                res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            }

            if (!res.ok) {
                console.log(`  API error ${res.status}: ${await res.text()}`);
                continue;
            }

            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) {
                console.log(`  No data returned.`);
                continue;
            }

            const rows = data.map((obs) => ({
                station_id: obs.id || obs.id_station || obs.geo_id_insee,
                timestamp: obs.validity_time,
                t: obs.t ? Math.round((obs.t - 273.15) * 10) / 10 : null,
                td: obs.td ? Math.round((obs.td - 273.15) * 10) / 10 : null,
                u: obs.u || null,
                ff: obs.ff ? Math.round(obs.ff * 3.6) : null,
                fxi: obs.fxy != null ? Math.round(obs.fxy * 3.6) : (obs.fxi != null ? Math.round(obs.fxi * 3.6) : null),
                dd: obs.dd || null,
                pres: obs.pres || null,
                rr1: obs.rr1 || 0
            })).filter((r) => r.station_id);

            const { error } = await supabase.from('observations_horaire').upsert(rows, { onConflict: 'station_id, timestamp' });
            if (error) {
                console.error(`  DB insert error: ${error.message}`);
            } else {
                console.log(`  Inserted ${rows.length} records.`);
            }
        } catch (err) {
            console.error(`  Error: ${err.message}`);
        }

        // Sleep 3 seconds between requests to avoid rate limit
        await new Promise(r => setTimeout(r, 3000));
    }

    console.log("Hourly backfill completed! Now running daily summaries resync...");
    
    // Sync daily summaries for all days in the period
    let syncDay = new Date(start);
    while (syncDay <= end) {
        const dayStr = syncDay.toISOString().split('T')[0];
        console.log(`Syncing daily summaries for ${dayStr}...`);
        const { error } = await supabase.rpc('batch_sync_daily_summaries', { target_date: dayStr });
        if (error) {
            console.error(`  Error syncing summaries for ${dayStr}: ${error.message}`);
        } else {
            console.log(`  Synced summaries for ${dayStr} successfully.`);
        }
        syncDay = new Date(syncDay.getTime() + 24 * 60 * 60 * 1000);
    }
    console.log("All done!");
}

run();
