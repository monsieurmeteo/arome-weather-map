async function run() {
    try {
        const res = await fetch('https://minisite-douai.vercel.app/', {
            headers: { 'cache-control': 'no-cache' }
        });
        const html = await res.text();
        
        // Find the index JS script src
        const jsMatch = html.match(/src="([^"]*assets\/index-[^"]*\.js)"/) || html.match(/href="([^"]*assets\/index-[^"]*\.js)"/);
        if (!jsMatch) {
            console.log("❌ Could not find index.js in html:", html);
            return;
        }
        
        const jsUrl = jsMatch[1].startsWith('http') ? jsMatch[1] : `https://minisite-douai.vercel.app${jsMatch[1]}`;
        console.log("Fetching JS Bundle:", jsUrl);
        
        const jsRes = await fetch(jsUrl);
        const jsText = await jsRes.text();
        
        if (jsText.includes('SeaTemperatureMap') || jsText.includes('carte-temperature-mer')) {
            console.log("✅ YES! The new JavaScript bundle with SeaTemperatureMap IS LIVE!");
        } else {
            console.log("❌ The old JavaScript bundle is still live.");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
