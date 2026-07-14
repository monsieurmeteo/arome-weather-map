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
    if (!j.access_token) { console.error('Token error:', j); process.exit(1); }
    return j.access_token;
}

async function main() {
    const token = await getToken();
    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };

    // --- 1. Flux 6mn BULK : vérifier TOUTES les clés présentes ---
    const now = new Date();
    const m = Math.floor(now.getUTCMinutes() / 6) * 6;
    const ts = new Date(now);
    ts.setUTCMinutes(m - 12, 0, 0);
    const dateStr = ts.toISOString().replace('.000Z', 'Z');
    console.log('\n══════════════════════════════════════════');
    console.log(`1) TEST BULK 6MN → date=${dateStr}`);
    console.log('══════════════════════════════════════════');

    const r1 = await fetch(
        `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`,
        { headers }
    );
    if (!r1.ok) { console.error('Erreur bulk 6mn:', r1.status, await r1.text()); }
    else {
        const data = await r1.json();
        console.log(`Nb stations reçues: ${data.length}`);
        const allKeys = new Set();
        data.forEach(r => Object.keys(r).forEach(k => allKeys.add(k)));
        console.log('Toutes les clés JSON présentes:', [...allKeys].sort().join(', '));

        // Chercher toute clé contenant "fx", "gst", "raf", "vent", "max", "wind", "3s", "fxi"
        const suspect = [...allKeys].filter(k =>
            /fx|gst|raf|wind|max|3s|inst/i.test(k)
        );
        console.log('Clés liées aux rafales/max:', suspect.length > 0 ? suspect : 'AUCUNE');

        // Pour chaque clé suspect, compter les non-null
        for (const k of suspect) {
            const nn = data.filter(r => r[k] != null).length;
            console.log(`  → "${k}": ${nn} valeurs non-null sur ${data.length}`);
            if (nn > 0) console.log('     Exemple:', data.find(r => r[k] != null));
        }

        // Afficher la ligne brute de la première station ventée
        const windy = data.filter(r => r.ff != null && r.ff > 7);
        console.log(`\nStations ventées (ff>7m/s): ${windy.length}`);
        if (windy.length > 0) {
            console.log('Exemple station ventée (brut):');
            console.log(JSON.stringify(windy[0], null, 2));
        }
    }

    // --- 2. API par station individuelle (DPObs) pour 5 stations connues ---
    const STATIONS = ['62160001', '59606001', '62029001', '29075001', '13054001'];
    console.log('\n══════════════════════════════════════════');
    console.log('2) TEST STATION INDIVIDUELLE (DPObs infrahoraire-6m)');
    console.log('══════════════════════════════════════════');
    for (const sid of STATIONS) {
        const r2 = await fetch(
            `https://public-api.meteofrance.fr/public/DPObs/v1/station/infrahoraire-6m?id_station=${sid}&format=json`,
            { headers }
        );
        if (!r2.ok) {
            console.log(`Station ${sid}: HTTP ${r2.status} - ${await r2.text()}`);
            continue;
        }
        const obs = await r2.json();
        const last = obs[obs.length - 1];
        console.log(`Station ${sid} (${obs.length} obs): fxi10=${last?.fxi10}, ff=${last?.ff}, validity=${last?.validity_time}`);
        // Vérifier si d'autres clés existent que dans le bulk
        const stKeys = Object.keys(last || {}).sort();
        console.log(`  Clés dispo: ${stKeys.join(', ')}`);
    }

    // --- 3. API horaire bulk (DPPaquetObs horaire) - vérifier fxy ---
    console.log('\n══════════════════════════════════════════');
    console.log('3) TEST BULK HORAIRE → vérification fxy / FXI3s');
    console.log('══════════════════════════════════════════');
    const hts = new Date(now);
    hts.setUTCMinutes(0, 0, 0);
    hts.setUTCHours(hts.getUTCHours() - 1);
    const hdateStr = hts.toISOString().replace('.000Z', 'Z');
    const r3 = await fetch(
        `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/horaire?date=${hdateStr}&format=json`,
        { headers }
    );
    if (!r3.ok) { console.error('Erreur bulk horaire:', r3.status, await r3.text()); }
    else {
        const hdata = await r3.json();
        const allHKeys = new Set();
        hdata.forEach(r => Object.keys(r).forEach(k => allHKeys.add(k)));
        console.log(`Nb stations (horaire): ${hdata.length}`);
        console.log('Toutes les clés JSON:', [...allHKeys].sort().join(', '));
        const hSuspect = [...allHKeys].filter(k => /fx|gst|raf|wind|max|3s|inst|fxi/i.test(k));
        console.log('Clés rafales/max:', hSuspect.length > 0 ? hSuspect : 'AUCUNE');
        for (const k of hSuspect) {
            const nn = hdata.filter(r => r[k] != null).length;
            console.log(`  → "${k}": ${nn} valeurs non-null sur ${hdata.length}`);
        }
    }
}

main().catch(console.error);
