async function run() {
    try {
        const res = await fetch('https://minisite-douai.vercel.app/', {
            headers: {
                'cache-control': 'no-cache',
                'User-Agent': 'Mozilla/5.0'
            }
        });
        const html = await res.text();
        console.log("HTML length:", html.length);
        if (html.includes('Température de la Mer')) {
            console.log("✅ The new version with the link IS LIVE!");
        } else {
            console.log("❌ The old version is still active.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
