import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs';

async function test() {
    const token = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
    const secret = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';
    const auth = Buffer.from(token + ':' + secret).toString('base64');
    const resAuth = await fetch('https://portail-api.meteofrance.fr/token', {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials'
    });
    const tData = await resAuth.json();
    const accToken = tData.access_token;

    const now = new Date();

    const results = [];
    now.setHours(now.getHours() - 2);
    now.setMinutes(Math.floor(now.getMinutes() / 6) * 6, 0, 0);

    for (let m = 0; m < 120; m += 6) {
        const d = new Date(now.getTime() + m * 60000);
        const dStr = d.toISOString().split('.')[0] + 'Z';
        const url = 'https://public-api.meteofrance.fr/public/DPObs/v1/station/infrahoraire-6m?id_station=59580003&date=' + dStr + '&format=json';
        const r = await fetch(url, { headers: { 'Authorization': 'Bearer ' + accToken } });
        if (r.ok && r.status === 200) {
            const j = await r.json();
            results.push(dStr + ' : OK, T=' + (j[0].t - 273.15).toFixed(1) + ' °C');
        } else {
            results.push(dStr + ' : ' + r.status);
        }
    }

    fs.writeFileSync('steenvoorde_6min_check.txt', results.join('\n'));
}
test();
