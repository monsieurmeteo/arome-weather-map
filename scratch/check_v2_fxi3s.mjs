// Test des endpoints v2 de l'API Météo-France avec FXI3s
// Annonce : 28/05/2026 - évolution nomenclature API Observations
//           02/06/2026 - FXI3s devient la référence
//           15/06/2026 - nouvelle référence rafale

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const KEY    = process.env.MF_CONSUMER_KEY    || 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const SECRET = process.env.MF_CONSUMER_SECRET || 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

async function getToken() {
    const auth = Buffer.from(`${KEY}:${SECRET}`).toString('base64');
    const res = await fetch('https://portail-api.meteofrance.fr/token', {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials'
    });
    const j = await res.json();
    return j.access_token;
}

async function testUrl(label, url, authHeader) {
    console.log(`\n→ ${label}`);
    console.log(`  URL: ${url}`);
    const r = await fetch(url, { headers: { Accept: 'application/json', ...authHeader } });
    console.log(`  Status: ${r.status}`);
    if (r.ok) {
        const text = await r.text();
        if (text.startsWith('<')) { console.log('  ❌ Retourne du HTML'); return null; }
        try {
            const data = JSON.parse(text);
            const arr = Array.isArray(data) ? data : (data.observations || data.data || [data]);
            if (arr.length === 0) { console.log('  ❌ Tableau vide'); return null; }
            const allKeys = new Set();
            arr.forEach(r => Object.keys(r).forEach(k => allKeys.add(k)));
            const keys = [...allKeys].sort();
            console.log(`  ✅ ${arr.length} obs - Clés: ${keys.join(', ')}`);
            // Chercher FXI3s et tout champ lié aux rafales
            const windKeys = keys.filter(k => /fx|gst|raf|3s|wind|rafale/i.test(k));
            console.log(`  🌬️ Clés rafale: ${windKeys.length > 0 ? windKeys.join(', ') : 'AUCUNE'}`);
            for (const k of windKeys) {
                const vals = arr.filter(r => r[k] !== null && r[k] !== undefined);
                console.log(`     "${k}": ${vals.length}/${arr.length} valeurs non-null`);
                if (vals.length > 0) console.log(`     Exemple: ${vals[0][k]}`);
            }
            return arr;
        } catch(e) { console.log('  ❌ JSON invalide:', text.substring(0, 100)); return null; }
    } else {
        const txt = await r.text();
        console.log('  ❌', txt.substring(0, 200));
        return null;
    }
}

async function main() {
    const token = await getToken();
    const bearerHeaders = { Authorization: `Bearer ${token}` };
    const apikeyHeaders = { apikey: token };

    // Calculer timestamp 6mn
    const now = new Date();
    const m = Math.floor(now.getUTCMinutes() / 6) * 6;
    const ts = new Date(now); ts.setUTCMinutes(m - 6, 0, 0);
    const dateStr = ts.toISOString().replace('.000Z', 'Z');
    const hts = new Date(now); hts.setUTCMinutes(0,0,0); hts.setUTCHours(hts.getUTCHours()-1);
    const hdateStr = hts.toISOString().replace('.000Z', 'Z');

    console.log('═══════════════════════════════════════════════════════');
    console.log('TEST API v2 + FXI3s — Météo-France');
    console.log('═══════════════════════════════════════════════════════');

    // 1. DPObs v2 - infrahoraire-6m bulk
    await testUrl('DPObs v2 - infrahoraire-6m (bulk)', 
        `https://public-api.meteofrance.fr/public/DPObs/v2/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`, 
        bearerHeaders);

    // 2. DPPaquetObs v2 - infrahoraire-6m
    await testUrl('DPPaquetObs v2 - infrahoraire-6m',
        `https://public-api.meteofrance.fr/public/DPPaquetObs/v2/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`,
        bearerHeaders);

    // 3. DPObs v2 - station individuelle infrahoraire
    await testUrl('DPObs v2 - station individuelle (59343001)',
        `https://public-api.meteofrance.fr/public/DPObs/v2/station/infrahoraire-6m?id_station=59343001&format=json`,
        bearerHeaders);

    // 4. DPObs v2 - horaire bulk
    await testUrl('DPObs v2 - horaire (bulk)',
        `https://public-api.meteofrance.fr/public/DPObs/v2/paquet/stations/horaire?date=${hdateStr}&format=json`,
        bearerHeaders);

    // 5. DPObs v1 infrahoraire avec apikey (pas Bearer) - peut-être autre résultat
    await testUrl('DPObs v1 - infrahoraire-6m avec apikey (station 59343001)',
        `https://public-api.meteofrance.fr/public/DPObs/v1/station/infrahoraire-6m?id_station=59343001&format=json`,
        apikeyHeaders);

    // 6. DPPaquetObs v1 avec apikey
    await testUrl('DPPaquetObs v1 - bulk infrahoraire avec apikey',
        `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`,
        apikeyHeaders);

    // 7. Nouvelle tentative avec endpoint observations (sans DP prefix)
    await testUrl('API Observations direct',
        `https://public-api.meteofrance.fr/public/observations/v1/station/infrahoraire-6m?id_station=59343001&format=json`,
        bearerHeaders);

    // 8. Peut-être endpoint nommé différemment
    await testUrl('API obs-infrahoraire-6m v2',
        `https://public-api.meteofrance.fr/public/DPObs/v1/station/infrahoraire-6m?id_station=59343001&format=json`,
        { ...bearerHeaders, 'X-API-Version': '2' });
}

main().catch(console.error);
