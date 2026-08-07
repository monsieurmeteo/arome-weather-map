const METEO_KEY = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const METEO_SECRET = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

async function test() {
    console.log("Testing token refresh...");
    const auth = Buffer.from(`${METEO_KEY}:${METEO_SECRET}`).toString('base64');
    const res = await fetch('https://portail-api.meteofrance.fr/token', {
        method: 'POST',
        headers: { 
            'Authorization': `Basic ${auth}`, 
            'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: 'grant_type=client_credentials'
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response data:", data);
}
test();
