import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const METEO_KEY = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const METEO_SECRET = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

async function refreshToken() {
    const auth = Buffer.from(`${METEO_KEY}:${METEO_SECRET}`).toString('base64');
    const res = await fetch('https://portail-api.meteofrance.fr/token', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials'
    });
    const data = await res.json();
    return data.access_token;
}

async function main() {
    const token = await refreshToken();
    // Fetch last 6min data
    const d = new Date(Date.now() - 2 * 3600000);
    const dateStr = d.toISOString().substring(0, 14) + '00:00Z'; // e.g. 2026-03-02T19:00:00Z

    console.log("Fetching infrahoraire for", dateStr);
    let url = `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`;
    let res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    let data = await res.json();

    let chauny6mn = Array.isArray(data) ? data.filter(obs => obs.geo_id_insee === '02173002' || obs.id_station === '02173002' || obs.id === '02173002') : [];
    console.log("Chauny 6min data length:", chauny6mn.length);
    if (chauny6mn.length) { console.log(chauny6mn); }
}
main();
