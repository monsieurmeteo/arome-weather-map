import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

async function trigger() {
    console.log('Triggering Edge Function collect-6mn manually...');
    const res = await fetch(`${url}/functions/v1/collect-6mn`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });

    if (!res.ok) {
        console.error('❌ Trigger failed:', res.status, res.statusText);
        const text = await res.text();
        console.error('Response:', text);
    } else {
        const json = await res.json();
        console.log('✅ Trigger succeeded!', json);
    }
}

trigger();
