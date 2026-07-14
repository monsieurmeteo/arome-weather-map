// Vérification de FXI3s dans TOUTES les APIs Météo-France
// L'annonce officielle dit : FXI3s disponible via API Climatologie (DPAI01) et meteo.data.gouv.fr

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

async function main() {
    const token = await getToken();
    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };

    // --- 1. API CLIMATOLOGIE (DPAI01) - endpoint horaire pour une station ---
    // C'est l'API citée dans l'annonce officielle pour FXI3s !
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Station Lille-Lesquin (62160001 ou 59343001)
    const stations = ['59343001', '62160001', '59606001'];
    
    console.log('══════════════════════════════════════════════════════');
    console.log('1) API CLIMATOLOGIE (DPAI01) - /station/horaire');
    console.log('   → Citée dans l\'annonce officielle pour FXI3s');
    console.log('══════════════════════════════════════════════════════');
    
    for (const sid of stations) {
        const url = `https://public-api.meteofrance.fr/public/DPAI01/v1/station/horaire?id_station=${sid}&date_debut=${yesterday}T22:00:00Z&date_fin=${today}T22:00:00Z&format=json`;
        console.log(`\nTest DPAI01 station ${sid}: ${url}`);
        const r = await fetch(url, { headers: { Accept: 'application/json', 'apikey': token } });
        console.log(`  Status: ${r.status}`);
        if (r.ok) {
            const text = await r.text();
            if (text.startsWith('<')) { console.log('  ❌ Retourne du HTML'); continue; }
            const data = JSON.parse(text);
            if (!Array.isArray(data) || data.length === 0) { console.log('  ❌ Tableau vide'); continue; }
            const allKeys = new Set();
            data.forEach(r => Object.keys(r).forEach(k => allKeys.add(k)));
            console.log(`  ✅ ${data.length} obs - Toutes les clés: ${[...allKeys].sort().join(', ')}`);
            // Chercher FXI3s ou tout champ vent/rafale
            const windKeys = [...allKeys].filter(k => /fx|gst|raf|3s|wind|max/i.test(k));
            console.log(`  Clés vent/rafale: ${windKeys.join(', ') || 'AUCUNE'}`);
            // Vérifier FXI3s spécifiquement
            const hasFxi3s = allKeys.has('fxi3s') || [...allKeys].some(k => k.toLowerCase().includes('3s'));
            console.log(`  FXI3s présent: ${hasFxi3s ? '✅ OUI' : '❌ NON'}`);
            if (data[0]) {
                const windData = {};
                windKeys.forEach(k => windData[k] = data[data.length-1][k]);
                console.log(`  Dernière obs valeurs vent:`, windData);
            }
        } else {
            console.log('  ❌', await r.text().then(t => t.substring(0, 200)));
        }
    }

    // --- 2. API DPObs infrahoraire-6m - chercher FXI3s ---
    console.log('\n══════════════════════════════════════════════════════');
    console.log('2) DPObs infrahoraire-6m - Chercher FXI3s dans la réponse');
    console.log('══════════════════════════════════════════════════════');
    
    const r2 = await fetch(
        `https://public-api.meteofrance.fr/public/DPObs/v1/station/infrahoraire-6m?id_station=59343001&format=json`,
        { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } }
    );
    if (r2.ok) {
        const data = await r2.json();
        console.log(`Nb obs: ${data.length}`);
        if (data[0]) {
            console.log('Toutes les clés:', Object.keys(data[data.length-1]).sort().join(', '));
            console.log('FXI3s présent:', Object.keys(data[0]).some(k => k.toLowerCase().includes('3s')) ? '✅ OUI' : '❌ NON');
            console.log('Dernière observation complète:', JSON.stringify(data[data.length-1], null, 2));
        }
    }

    // --- 3. meteo.data.gouv.fr - vérifier les dernières observations ---
    console.log('\n══════════════════════════════════════════════════════');
    console.log('3) meteo.data.gouv.fr - Recherche fichiers récents');
    console.log('══════════════════════════════════════════════════════');
    
    const r3 = await fetch('https://meteo.data.gouv.fr/api/v1/public/datasets?tags=observation&q=infrahoraire', {
        headers: { Accept: 'application/json' }
    });
    console.log('API data.gouv.fr datasets status:', r3.status);
    if (r3.ok) {
        const txt = await r3.text();
        console.log('Réponse:', txt.substring(0, 500));
    }
}

main().catch(console.error);
