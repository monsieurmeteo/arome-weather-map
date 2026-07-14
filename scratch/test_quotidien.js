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

    // Call quotidien paquet API
    // Let's check for yesterday
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dateStr = yesterday.toISOString().split('T')[0] + 'T00:00:00Z';
    console.log("Testing date:", dateStr);

    const url = `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/quotidien?date=${dateStr}&format=json`;
    console.log("Fetching url:", url);
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
        const data = await res.json();
        console.log(`Received ${data.length} stations.`);
        console.log("Sample station:", JSON.stringify(data[0] || {}, null, 2));
        
        const allKeys = new Set();
        data.forEach(obs => {
            Object.keys(obs).forEach(k => allKeys.add(k));
        });
        console.log("All unique keys in Quotidien response:", Array.from(allKeys));
    } else {
        console.error("API call failed:", res.status, await res.text());
    }
}

test();
