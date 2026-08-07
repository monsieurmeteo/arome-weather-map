// Test Hourly API with Date
const consumerKey = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const consumerSecret = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

async function getToken() {
    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const resp = await fetch('https://portail-api.meteofrance.fr/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    const data = await resp.json();
    return data.access_token;
}

async function testHourlyDate() {
    const token = await getToken();
    const targetDate = '2026-04-29T12:00:00Z';
    console.log(`Testing Hourly API for ${targetDate}...`);
    
    const resp = await fetch(`https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/horaire?date=${targetDate}&format=json`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Status:', resp.status);
    if (resp.status === 200) {
        const data = await resp.json();
        console.log('✅ Success! Found hourly data for', data.length, 'stations.');
        console.log('Sample station:', data[0]);
    } else {
        const err = await resp.text();
        console.log('❌ Error:', err);
    }
}

testHourlyDate();
