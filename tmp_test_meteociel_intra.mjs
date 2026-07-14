import fs from 'fs';

async function testFetchMeteocielIntra() {
    const stationId = '59178001'; // Douai
    const day = 7;
    const month = 2; // Mars
    const year = 2026;

    const url = `https://www.meteociel.fr/temps-reel/obs_villes.php?code2=${stationId}&jour2=${day}&mois2=${month}&annee2=${year}&affint=1`;

    console.log(`Fetching ${url}...`);
    const res = await fetch(url);
    const html = await res.text();

    fs.writeFileSync('tmp_meteociel_intra.html', html);
    console.log('HTML saved to tmp_meteociel_intra.html');
}

testFetchMeteocielIntra();
