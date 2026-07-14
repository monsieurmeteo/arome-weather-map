// Vérification : combien de postes ont raf10 non-null et pourquoi certains n'ont pas de valeur
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
    
    const now = new Date();
    const m = Math.floor(now.getUTCMinutes() / 6) * 6;
    const ts = new Date(now);
    ts.setUTCMinutes(m - 6, 0, 0);
    const dateStr = ts.toISOString().replace('.000Z', 'Z');

    console.log(`Test à ${dateStr} — API v2\n`);

    const r = await fetch(
        `https://public-api.meteofrance.fr/public/DPPaquetObs/v2/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await r.json();

    const total = data.length;
    const avecRaf10 = data.filter(s => s.raf10 !== null && s.raf10 !== undefined);
    const sansRaf10  = data.filter(s => s.raf10 === null || s.raf10 === undefined);

    console.log(`Total postes reçus     : ${total}`);
    console.log(`Postes AVEC raf10      : ${avecRaf10.length} (${Math.round(avecRaf10.length/total*100)}%)`);
    console.log(`Postes SANS raf10      : ${sansRaf10.length} (${Math.round(sansRaf10.length/total*100)}%)`);

    // Est-ce que les postes sans raf10 ont quand même du vent (ff) ?
    const sansRaf10MaisVenteux = sansRaf10.filter(s => s.ff !== null && s.ff > 3);
    console.log(`\nPostes SANS raf10 mais avec vent (ff > 3 m/s) : ${sansRaf10MaisVenteux.length}`);
    if (sansRaf10MaisVenteux.length > 0) {
        console.log('Exemples :');
        sansRaf10MaisVenteux.slice(0, 10).forEach(s => {
            console.log(`  Station ${s.geo_id_insee}: ff=${s.ff} m/s, raf10=${s.raf10}, ddraf10=${s.ddraf10}`);
        });
    }

    // Vérifier les postes les plus ventés et leur raf10
    const plusVentes = data.filter(s => s.ff !== null).sort((a,b) => b.ff - a.ff).slice(0, 10);
    console.log('\nTop 10 stations les plus ventées :');
    plusVentes.forEach(s => {
        console.log(`  Station ${s.geo_id_insee}: ff=${Math.round(s.ff*3.6)}km/h, raf10=${s.raf10 !== null ? Math.round(s.raf10*3.6)+'km/h' : 'NULL'}`);
    });

    // Checker plusieurs timestamps pour voir si c'est mieux sur une autre période
    console.log('\n--- Test sur 3 timestamps différents ---');
    for (let offset = 6; offset <= 18; offset += 6) {
        const ts2 = new Date(now);
        ts2.setUTCMinutes(Math.floor(now.getUTCMinutes()/6)*6 - offset, 0, 0);
        const d2 = ts2.toISOString().replace('.000Z', 'Z');
        const r2 = await fetch(
            `https://public-api.meteofrance.fr/public/DPPaquetObs/v2/paquet/stations/infrahoraire-6m?date=${d2}&format=json`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const data2 = await r2.json();
        const avec2 = data2.filter(s => s.raf10 !== null && s.raf10 !== undefined).length;
        console.log(`  ${d2} : ${avec2}/${data2.length} postes avec raf10 (${Math.round(avec2/data2.length*100)}%)`);
    }
}

main().catch(console.error);
