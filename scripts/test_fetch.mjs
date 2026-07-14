import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testFetch() {
    const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/daily_summaries?select=count&limit=1`;
    console.log("Fetching:", url);

    try {
        const res = await fetch(url, {
            headers: {
                'apikey': process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${process.env.VITE_SUPABASE_SERVICE_ROLE_KEY}`
            }
        });
        const data = await res.json();
        console.log("Success:", data);
    } catch (e) {
        console.error("Fetch error:", e.message);
    }
}

testFetch();
