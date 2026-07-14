import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

const METEO_KEY = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const METEO_SECRET = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

async function getOrRefreshToken() {
    const { data: secrets } = await supabase
        .from('api_secrets')
        .select('access_token')
        .eq('provider', 'meteo_france')
        .single();
    
    let token = secrets?.access_token;
    if (!token) {
        console.log("Refreshing Token...");
        const auth = btoa(`${METEO_KEY}:${METEO_SECRET}`);
        const res = await fetch('https://portail-api.meteofrance.fr/token', {
            method: 'POST',
            headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'grant_type=client_credentials'
        });
        const data = await res.json();
        token = data.access_token;
    }
    return token;
}

async function test() {
    const token = await getOrRefreshToken();
    
    const now = new Date();
    const minutes = Math.floor(now.getUTCMinutes() / 6) * 6;
    const target = new Date(now);
    target.setUTCMinutes(minutes - 12, 0, 0); // 2 intervals ago to ensure data is there
    const dateStr = target.toISOString().split('.')[0] + 'Z';
    console.log("Thorough check for timestamp:", dateStr);

    const url = `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    
    if (!res.ok) {
        console.error("API Error:", res.status, await res.text());
        return;
    }

    const data = await res.json();
    console.log(`Successfully fetched ${data.length} records.`);

    // 1. Gather ALL unique keys across all 1900+ stations
    const allKeys = new Set();
    data.forEach(item => {
        Object.keys(item).forEach(k => allKeys.add(k));
    });
    console.log("ALL unique keys across ALL stations in the response:", Array.from(allKeys));

    // 2. Search for any key containing "fx", "gst", "max", or "wind"
    const windKeys = Array.from(allKeys).filter(k => k.toLowerCase().includes('fx') || k.toLowerCase().includes('gst') || k.toLowerCase().includes('max') || k.toLowerCase().includes('wind'));
    console.log("Wind/Gust related keys found:", windKeys);

    // 3. For each wind key, check if there is ANY non-null value in the entire dataset
    windKeys.forEach(key => {
        const nonNullRecords = data.filter(item => item[key] !== null && item[key] !== undefined);
        console.log(`Key "${key}": has ${nonNullRecords.length} non-null values out of ${data.length} records.`);
        if (nonNullRecords.length > 0) {
            console.log(`  Sample values for "${key}":`, nonNullRecords.slice(0, 5).map(r => `${r.geo_id_insee}: ${r[key]}`));
        }
    });

    // 4. Let's look at stations with very high wind speeds (ff > 10 m/s or 36 km/h) and check if their fxi10 is still null
    const windyStations = data.filter(r => r.ff !== null && r.ff > 8); // ff > 8 m/s (approx 30 km/h)
    console.log(`Found ${windyStations.length} windy stations (ff > 8 m/s):`);
    windyStations.forEach(s => {
        console.log(`  Station ${s.geo_id_insee}: ff=${s.ff} m/s, fxi10=${s.fxi10}, dxi10=${s.dxi10}`);
    });
}

test();
