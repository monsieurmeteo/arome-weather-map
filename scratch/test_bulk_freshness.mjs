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

async function testBulkFreshness() {
    console.log('--- TEST DE FRAÎCHEUR API BULK ---');
    try {
        const token = await getToken();
        const now = new Date();
        
        console.log(`Heure actuelle (UTC) : ${now.toISOString()}`);

        // Tester de 6 min à 42 min de retard
        const slots = [];
        for (let offsetMin = 6; offsetMin <= 42; offsetMin += 6) {
            const slot = new Date(Math.floor(now.getTime() / 360000) * 360000 - offsetMin * 60000);
            slots.push({ slot, offsetMin });
        }

        for (const item of slots) {
            const dateStr = item.slot.toISOString().split('.')[0] + 'Z';
            const url = `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`;
            
            const start = Date.now();
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            const duration = Date.now() - start;

            if (res.ok) {
                const data = await res.json();
                console.log(`  ✅ ${dateStr} (il y a ${item.offsetMin} min) : DISPONIBLE ! Trouvé ${data ? data.length : 0} stations (${duration}ms)`);
            } else {
                console.log(`  ❌ ${dateStr} (il y a ${item.offsetMin} min) : Non disponible (HTTP ${res.status}) (${duration}ms)`);
            }
            // Petite pause
            await new Promise(r => setTimeout(r, 300));
        }
    } catch (e) {
        console.error('Erreur:', e.message);
    }
}

testBulkFreshness();
