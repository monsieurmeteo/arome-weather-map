// Test Hourly API natif
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

async function testHourlyAPI() {
    const token = await getToken();
    console.log('Token acquired. Testing Hourly Paquet API...');
    
    // Testing Hourly
    const resp = await fetch('https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/horaire?format=json', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Status:', resp.status);
    if (resp.status === 200) {
        const data = await resp.json();
        console.log('✅ Success! Found hourly data for', data.length, 'stations.');
        console.log('Sample station:', data[0]);
    } else {
        console.log('❌ Hourly API not available or error.');
        const err = await resp.text();
        console.log(err);
    }
}

testHourlyAPI();
