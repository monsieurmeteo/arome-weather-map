// Diagnostic complet pour Valenciennes
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
    return (await res.json()).access_token;
}

async function main() {
    const token = await getToken();
    const bearer = { Authorization: `Bearer ${token}` };
    const apikey = { apikey: token };

    // IDs possibles pour Valenciennes
    const STATIONS = ['59606001', '59606', '59606002', '59650001'];
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    console.log('=== DIAGNOSTIC VALENCIENNES ===\n');

    for (const sid of STATIONS) {
        console.log(`\n--- Station ${sid} ---`);

        // 1. API DPObs v1 station horaire (Bearer) - temps réel
        const r1 = await fetch(
            `https://public-api.meteofrance.fr/public/DPObs/v1/station/horaire?id_station=${sid}&format=json`,
            { headers: bearer }
        );
        console.log(`  DPObs v1 horaire (Bearer): ${r1.status}`);
        if (r1.ok) {
            const d = await r1.json();
            if (d.length > 0) {
                const last = d[d.length-1];
                console.log(`    → ${d.length} obs | ff=${last.ff}, fxi=${last.fxi}, fxy=${last.fxy}, raf10=${last.raf10}`);
                console.log(`    Toutes clés: ${Object.keys(last).sort().join(', ')}`);
            } else { console.log('    → Vide'); }
        }

        // 2. API DPAI01 v1 station horaire (Bearer) - archives
        const r2 = await fetch(
            `https://public-api.meteofrance.fr/public/DPAI01/v1/station/horaire?id_station=${sid}&date_debut=${yesterday}T00:00:00Z&date_fin=${today}T23:59:59Z&format=json`,
            { headers: bearer }
        );
        console.log(`  DPAI01 v1 horaire (Bearer): ${r2.status}`);
        if (r2.ok) {
            const txt = await r2.text();
            if (!txt.startsWith('<')) {
                const d = JSON.parse(txt);
                if (d.length > 0) {
                    const last = d[d.length-1];
                    console.log(`    → ${d.length} obs | ff=${last.ff}, fxi=${last.fxi}, fxy=${last.fxy}, raf10=${last.raf10}`);
                    console.log(`    Toutes clés: ${Object.keys(last).sort().join(', ')}`);
                } else { console.log('    → Vide'); }
            } else { console.log('    → HTML (403/redirect)'); }
        }

        // 3. API v2 infrahoraire-6m individuelle
        const r3 = await fetch(
            `https://public-api.meteofrance.fr/public/DPObs/v2/station/infrahoraire-6m?id_station=${sid}&format=json`,
            { headers: bearer }
        );
        console.log(`  DPObs v2 infrahoraire-6m: ${r3.status}`);
        if (r3.ok) {
            const d = await r3.json();
            if (d.length > 0) {
                const last = d[d.length-1];
                console.log(`    → ${d.length} obs | ff=${last.ff}, raf10=${last.raf10}, ddraf10=${last.ddraf10}`);
            } else { console.log('    → Vide'); }
        }
    }

    // Recherche Valenciennes dans le bulk v2 6mn
    console.log('\n=== Recherche Valenciennes dans bulk v2 ===');
    const now = new Date();
    const m = Math.floor(now.getUTCMinutes() / 6) * 6;
    const ts = new Date(now); ts.setUTCMinutes(m - 6, 0, 0);
    const dateStr = ts.toISOString().replace('.000Z', 'Z');
    const rb = await fetch(
        `https://public-api.meteofrance.fr/public/DPPaquetObs/v2/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`,
        { headers: bearer }
    );
    const bulk = await rb.json();
    const val = bulk.filter(s => s.geo_id_insee && s.geo_id_insee.startsWith('596'));
    console.log(`Stations commençant par 596 (Nord/Valenciennes area): ${val.length}`);
    val.forEach(s => console.log(`  ${s.geo_id_insee}: ff=${s.ff ? Math.round(s.ff*3.6)+'km/h' : 'null'}, raf10=${s.raf10 ? Math.round(s.raf10*3.6)+'km/h' : 'null'}`));
}

main().catch(console.error);
