import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const METEO_KEY = process.env.MF_CONSUMER_KEY || 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const METEO_SECRET = process.env.MF_CONSUMER_SECRET || 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

async function getToken() {
    const auth = Buffer.from(`${METEO_KEY}:${METEO_SECRET}`).toString('base64');
    const res = await fetch('https://portail-api.meteofrance.fr/token', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials'
    });
    if (!res.ok) throw new Error('Token refresh failed');
    const data = await res.json();
    return data.access_token;
}

async function testFreshness() {
    console.log('--- TEST DE FRAÎCHEUR API INDIVIDUELLE ---');
    try {
        const token = await getToken();
        const now = new Date();
        
        // Tester les créneaux récents : de 6 min à 36 min de retard
        const slots = [];
        for (let offsetMin = 6; offsetMin <= 36; offsetMin += 6) {
            const slot = new Date(Math.floor(now.getTime() / 360000) * 360000 - offsetMin * 60000);
            slots.push(slot);
        }

        const stations = [
            { id: '59178001', name: 'Douai' },
            { id: '59350001', name: 'Lille' }
        ];

        for (const station of stations) {
            console.log(`\nStation: ${station.name} (${station.id})`);
            for (const slot of slots) {
                const dateStr = slot.toISOString().split('.')[0] + 'Z';
                const url = `https://public-api.meteofrance.fr/public/DPObs/v1/station/infrahoraire-6m?id_station=${station.id}&date=${dateStr}&format=json`;
                
                const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                if (res.ok) {
                    const data = await res.json();
                    console.log(`  ✅ Slot ${dateStr} : Disponible (HTTP 200). Observations trouvées: ${data.length}`);
                    if (data && data[0]) {
                        console.log(`     T = ${data[0].t ? (data[0].t - 273.15).toFixed(1) : 'null'} °C, Wind = ${data[0].ff ? (data[0].ff * 3.6).toFixed(0) : 'null'} km/h`);
                    }
                } else {
                    console.log(`  ❌ Slot ${dateStr} : Non disponible (HTTP ${res.status})`);
                }
            }
        }
    } catch (e) {
        console.error('Erreur:', e.message);
    }
}

testFreshness();
