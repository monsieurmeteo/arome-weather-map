import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

const METEO_KEY = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const METEO_SECRET = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

async function test() {
    // Get Token
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

    const now = new Date(Date.now() - 40 * 60 * 1000);
    const min = Math.floor(now.getMinutes() / 6) * 6;
    now.setMinutes(min, 0, 0);
    const dateStr = now.toISOString().split('.')[0] + 'Z';
    console.log("Testing date:", dateStr);

    const url = `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`;
    console.log("Fetching url:", url);
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
        const data = await res.json();
        console.log(`Received ${data.length} stations.`);
        
        const allKeys = new Set();
        data.forEach(obs => {
            Object.keys(obs).forEach(k => allKeys.add(k));
        });
        console.log("All unique keys in DPObs bulk response:", Array.from(allKeys));

        // Check if any station has a non-null value for any wind/gust key
        const windKeys = ['ff', 'fxi10', 'dxi10', 'fxi', 'fxy', 'fxi3s', 'dxi3s'];
        windKeys.forEach(k => {
            const nonNullCount = data.filter(obs => obs[k] !== null && obs[k] !== undefined).length;
            console.log(`Key ${k}: ${nonNullCount} non-null values out of ${data.length}`);
        });
    } else {
        console.error("API call failed:", res.status, await res.text());
    }
}

test();
