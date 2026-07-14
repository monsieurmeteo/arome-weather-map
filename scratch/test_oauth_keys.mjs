// Test OAuth natif

const consumerKey = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const consumerSecret = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

async function testOAuth() {
    console.log('Testing OAuth...');
    const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    
    try {
        const response = await fetch('https://portail-api.meteofrance.fr/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });
        
        const data = await response.json();
        console.log('Response Status:', response.status);
        if (data.access_token) {
            console.log('✅ Success! Token generated:', data.access_token.substring(0, 20) + '...');
        } else {
            console.error('❌ Failed:', data);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testOAuth();
