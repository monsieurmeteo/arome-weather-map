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
    
    // Calculate a recent 6-minute timestamp (e.g. 10 minutes ago, rounded to 6 minutes)
    const now = new Date();
    const minutes = Math.floor(now.getUTCMinutes() / 6) * 6;
    const target = new Date(now);
    target.setUTCMinutes(minutes - 6, 0, 0); // 1 interval ago
    const dateStr = target.toISOString().split('.')[0] + 'Z';
    console.log("Querying target timestamp:", dateStr);

    // Fetch bulk 6mn data
    const url = `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`;
    console.log("Fetching bulk 6mn data from:", url);
    
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    console.log("Status:", res.status);
    if (res.ok) {
        const data = await res.json();
        console.log(`Received ${data.length} records.`);
        
        // Count how many have non-null fxi10
        const withFxi10 = data.filter(item => item.fxi10 !== null && item.fxi10 !== undefined);
        console.log(`Number of records with non-null fxi10: ${withFxi10.length}`);
        
        if (withFxi10.length > 0) {
            console.log("Sample records with fxi10:");
            console.log(JSON.stringify(withFxi10.slice(0, 3), null, 2));
        }
    } else {
        console.error("Error:", await res.text());
    }
}

test();
