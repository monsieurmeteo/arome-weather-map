import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const consumerKey = process.env.MF_CONSUMER_KEY || 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const consumerSecret = process.env.MF_CONSUMER_SECRET || 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

async function testFetch() {
    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResp = await fetch('https://portail-api.meteofrance.fr/token', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials'
    });
    const tokenData = await tokenResp.json();
    const token = tokenData.access_token;
    console.log('Token:', token ? 'Obtained' : 'Failed');

    const targetTime = '2026-05-05T01:36:00Z';
    const resp = await fetch(`https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/infrahoraire-6m?date=${targetTime}&format=json`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('API Status:', resp.status);
    if (resp.status === 200) {
        const data = await resp.json();
        console.log('Stations found:', data.length);
    }
}
testFetch();
