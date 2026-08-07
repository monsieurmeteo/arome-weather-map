// Test how many 6mn records we can get for one station
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

async function testHistoryDepth() {
    const token = await getToken();
    const stationId = '59178001';
    console.log(`Testing history depth for ${stationId}...`);
    
    const resp = await fetch(`https://public-api.meteofrance.fr/public/DPObs/v1/station/infrahoraire-6m?id_station=${stationId}&format=json`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (resp.status === 200) {
        const data = await resp.json();
        const obs = data.results || [];
        console.log(`Found ${obs.length} records.`);
        if (obs.length > 0) {
            console.log('Oldest:', obs[obs.length - 1].validity_time);
            console.log('Latest:', obs[0].validity_time);
        }
    } else {
        console.error('Error:', resp.status, await resp.text());
    }
}

testHistoryDepth();
