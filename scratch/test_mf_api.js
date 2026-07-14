import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function refreshToken() {
    const client_id = process.env.METEO_FRANCE_CLIENT_ID || "dG1hTDJGdjdaTkwwZEtfS25DNGY1dDhuOHlJYTpuVlp4NnZid3BvdGhaOUhiSE42dmZlMmpBOGNh";
    const res = await fetch("https://portail-api.meteofrance.fr/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + client_id
        },
        body: "grant_type=client_credentials"
    });
    if (res.ok) {
        const body = await res.json();
        return body.access_token;
    }
    throw new Error("Failed to refresh token: " + res.status);
}

async function run() {
    try {
        let token;
        const { data: secrets } = await supabase
            .from('api_secrets')
            .select('access_token')
            .eq('provider', 'meteo_france')
            .single();

        token = secrets?.access_token;
        if (!token) token = await refreshToken();

        // 19:30:00Z is a multiple of 6 and 10
        const dateStr = "2026-07-02T19:30:00Z";

        console.log("Fetching slot:", dateStr);
        const url = `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`;
        let res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        
        if (res.status === 401) {
            token = await refreshToken();
            res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        }

        if (res.ok) {
            const bulkData = await res.json();
            
            const keyCounts = {};
            bulkData.forEach(obs => {
                Object.entries(obs).forEach(([k, v]) => {
                    if (v !== null && v !== undefined) {
                        keyCounts[k] = (keyCounts[k] || 0) + 1;
                    }
                });
            });
            
            console.log("Keys with non-null counts at 19:30:", keyCounts);
        } else {
            console.error("HTTP error:", res.status);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
