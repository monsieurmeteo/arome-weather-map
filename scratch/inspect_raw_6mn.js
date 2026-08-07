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
    
    // Lille station ID is 59343001
    // Let's call /station/infrahoraire-6m for Lille
    const url = `https://public-api.meteofrance.fr/public/DPObs/v1/station/infrahoraire-6m?id_station=59343001&format=json`;
    console.log("Fetching Lille 6mn data from:", url);
    
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    console.log("Status:", res.status);
    if (res.ok) {
        const data = await res.json();
        console.log(`Success! Received ${data.length} records.`);
        if (data.length > 0) {
            console.log("Most recent record keys and values:");
            const record = data[0];
            console.log(JSON.stringify(record, null, 2));
            
            // Print all unique keys across all records
            const allKeys = new Set();
            data.forEach(item => Object.keys(item).forEach(k => allKeys.add(k)));
            console.log("All unique keys in DPObs 6mn response:", Array.from(allKeys));
        }
    } else {
        console.error("Error response:", await res.text());
    }
}

test();
