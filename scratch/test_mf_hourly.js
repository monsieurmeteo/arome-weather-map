import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

const METEO_KEY = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const METEO_SECRET = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

async function test() {
    const { data: secrets } = await supabase
        .from('api_secrets')
        .select('access_token')
        .eq('provider', 'meteo_france')
        .single();
    
    let token = secrets?.access_token;
    if (!token) {
        const auth = btoa(`${METEO_KEY}:${METEO_SECRET}`);
        const res = await fetch('https://portail-api.meteofrance.fr/token', {
            method: 'POST',
            headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'grant_type=client_credentials'
        });
        const data = await res.json();
        token = data.access_token;
    }

    const now = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    now.setMinutes(0, 0, 0);
    const dateStr = now.toISOString().split('.')[0] + 'Z';
    console.log("Testing date:", dateStr);

    const url = `https://public-api.meteofrance.fr/public/DPObs/v1/station/horaire?id_station=59343001&date=${dateStr}&format=json`;
    console.log("Fetching url:", url);
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
        const data = await res.json();
        console.log("Hourly JSON for station 59343001:", JSON.stringify(data[0] || {}, null, 2));
    } else {
        console.error("API call failed:", res.status, await res.text());
    }
}

test();
