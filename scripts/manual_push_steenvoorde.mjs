import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const stationNamesData = JSON.parse(fs.readFileSync('./src/data/stationNames.json', 'utf-8'));

async function getValidToken() {
    const token = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
    const secret = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';
    const auth = Buffer.from(token + ':' + secret).toString('base64');
    const resAuth = await fetch('https://portail-api.meteofrance.fr/token', {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials'
    });
    const tData = await resAuth.json();
    return tData.access_token;
}

function getLatestCycleTime() {
    const now = new Date();
    const minutes = now.getUTCMinutes();
    const roundedMinutes = Math.floor(minutes / 6) * 6;
    const cycleDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), roundedMinutes, 0));
    cycleDate.setMinutes(cycleDate.getMinutes() - 24); // Delay
    return cycleDate.toISOString().split('.')[0] + 'Z';
}

async function fetchStationDPObs(stationId, cycleTime, headers) {
    try {
        const url = `https://public-api.meteofrance.fr/public/DPObs/v1/station/infrahoraire-6m?id_station=${stationId}&date=${cycleTime}&format=json`;
        const response = await fetch(url, { headers });
        if (!response.ok) return null;
        const data = await response.json();
        return Array.isArray(data) && data.length > 0 ? data[0] : null;
    } catch (e) { return null; }
}

async function archiveToSupabase(data) {
    if (!data || data.length === 0) return;
    const allRows = data.map(obs => {
        const stationId = obs.geo_id_insee || obs.id;
        console.log(`Pushing row for ${stationId} at ${obs.validity_time || 'NOW'}`);
        let fxiKmh = null;
        if (obs.fxi10 != null) fxiKmh = Math.round(obs.fxi10 * 3.6);
        else if (obs.fxi != null) fxiKmh = Math.round(obs.fxi * 3.6);
        return {
            station_id: stationId,
            timestamp: obs.validity_time,
            t: obs.t != null ? Math.round((obs.t - 273.15) * 10) / 10 : null,
            td: obs.td != null ? Math.round((obs.td - 273.15) * 10) / 10 : null,
            u: obs.u ?? null,
            ff: obs.ff != null ? Math.round(obs.ff * 3.6) : null,
            rr_per: obs.rr_per ?? 0,
            pres: obs.pres ?? null,
            fxi: fxiKmh,
            dd: obs.dd ?? null,
            vv: obs.vv ?? null
        };
    });

    const { data: resData, error } = await supabase.from('observations_6mn').upsert(allRows, { onConflict: 'station_id, timestamp', ignoreDuplicates: true });
    if (error) {
        console.error('ERROR PUSHING:', error.message);
    } else {
        console.log('Successfully pushed', allRows.length, 'rows.');
    }
}

async function run() {
    const token = await getValidToken();
    const headers = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' };

    const now = new Date();
    const m = now.getUTCMinutes();
    const rm = Math.floor(m / 6) * 6;

    console.log('Running catch-up for Steenvoorde (last 3 hours)...');

    for (let i = 0; i < 30; i++) {
        const cycle = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), rm, 0));
        cycle.setMinutes(cycle.getMinutes() - (24 + i * 6));
        const dStr = cycle.toISOString().split('.')[0] + 'Z';

        const steen = await fetchStationDPObs('59580003', dStr, headers);
        if (steen) {
            await archiveToSupabase([steen]);
        }
    }
}

run();
