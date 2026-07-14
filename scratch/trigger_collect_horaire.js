import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = `${process.env.VITE_SUPABASE_URL}/functions/v1/collect-horaire`;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

async function run() {
    console.log("Triggering collect-horaire Edge Function in loop until up-to-date...");
    let caughtUp = false;
    let iterations = 0;
    while (!caughtUp && iterations < 30) {
        iterations++;
        console.log(`Iteration ${iterations}...`);
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Response:", text);

        if (text.includes("Up to date")) {
            caughtUp = true;
            console.log("Fully caught up!");
        } else if (!res.ok) {
            console.error("Error occurred, stopping.");
            break;
        }
        await new Promise(r => setTimeout(r, 2000)); // Sleep 2s between requests to avoid overloading the API
    }
}
run();
