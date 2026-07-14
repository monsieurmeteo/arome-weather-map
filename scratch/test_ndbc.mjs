async function run() {
    try {
        const res = await fetch('https://www.ndbc.noaa.gov/station_page.php?station=9HA4777', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });
        const html = await res.text();
        console.log("HTML length:", html.length);
        
        // Find Latitude/Longitude patterns
        const match = html.match(/(\d+\.\d+\s*[N|S])\s+(\d+\.\d+\s*[W|E])/i) || html.match(/(\d+\.\d+)\s*&deg;?\s*([N|S])\s+(\d+\.\d+)\s*&deg;?\s*([W|E])/i);
        if (match) {
            console.log("Found match:", match[0]);
        } else {
            // Let's print the section around the word "Location" or "Coords"
            const locIdx = html.toLowerCase().indexOf('location:');
            if (locIdx !== -1) {
                console.log(html.slice(locIdx - 100, locIdx + 800));
            } else {
                console.log("No location keyword found.");
                const headerIdx = html.indexOf('<h1>');
                if (headerIdx !== -1) {
                    console.log(html.slice(headerIdx, headerIdx + 1000));
                }
            }
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
