async function run() {
    const res = await fetch('https://www.meteociel.fr/temps-reel/obs_boueebateau.php?code2=62050', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
    });
    const html = await res.text();
    console.log("HTML length:", html.length);
    
    // Look for latitude, longitude, coords, etc.
    const coordMatches = html.match(/Latitude[\s\S]*?<\/td>/gi) || html.match(/Longitude[\s\S]*?<\/td>/gi) || html.match(/\d+[\s\S]*?[N|S][\s\S]*?\d+[\s\S]*?[W|E]/gi);
    if (coordMatches) {
        console.log("Found coord matches:", coordMatches);
    }
    
    // Search for keywords related to coordinates or the station code
    const index = html.indexOf('62050');
    if (index !== -1) {
        console.log("Raw HTML snippet starting at station code 62050:");
        console.log(html.slice(index - 200, index + 1800));
    } else {
        console.log("Station code 62050 not found in page body.");
    }
}
run();
