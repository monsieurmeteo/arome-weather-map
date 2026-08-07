import fs from 'fs';
import path from 'path';

async function testFetchMeteociel() {
    const stationId = '59178001'; // Douai
    const day = 7;
    const month = 2; // Mars is 2 in mois2? Actually let's check February (1)
    const year = 2026;

    // mois2 is 0-indexed according to meteocielService.js
    // So Feb is 1.
    const url = `https://www.meteociel.fr/temps-reel/obs_villes.php?code2=${stationId}&jour2=${day}&mois2=${month}&annee2=${year}`;

    console.log(`Fetching ${url}...`);
    const res = await fetch(url);
    const html = await res.text();

    // Save to tmp to inspect
    fs.writeFileSync('tmp_meteociel_test.html', html);
    console.log('HTML saved to tmp_meteociel_test.html');

    // Extract table rows for a quick look
    const tableRegex = /<table border="1" cellPadding="2" cellSpacing="0" width="100%">(.*?)<\/table>/gs;
    const match = tableRegex.exec(html);
    if (match) {
        console.log('Found table!');
        // Look for rows with "h" (hour)
        const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
        let row;
        let count = 0;
        while ((row = rowRegex.exec(match[1])) && count < 10) {
            console.log(`Row ${count}: ${row[1].substring(0, 100)}...`);
            count++;
        }
    } else {
        console.log('Table not found with regex');
    }
}

testFetchMeteociel();
