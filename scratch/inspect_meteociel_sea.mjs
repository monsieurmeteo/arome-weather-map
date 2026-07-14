// Native fetch used

async function run() {
    const res = await fetch('https://www.meteociel.fr/observations-meteo/temperature-de-la-mer.php', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
    });
    const html = await res.text();
    console.log("HTML length:", html.length);
    
    // Look for <map> or <area> tags
    const mapMatches = html.match(/<map[\s\S]*?<\/map>/gi);
    if (mapMatches) {
        console.log("Found maps:", mapMatches.length);
        mapMatches.forEach((m, idx) => {
            console.log(`Map ${idx}:`, m.slice(0, 500), "...");
        });
    } else {
        console.log("No <map> tags found.");
    }

    // Look for tables or data
    const areaMatches = html.match(/<area[\s\S]*?>/gi);
    if (areaMatches) {
        console.log("Found areas:", areaMatches.length);
        console.log("Sample areas:", areaMatches.slice(0, 10));
    }

    // Search for keywords like "sst.gif" or other image tags
    const imgMatches = html.match(/<img[\s\S]*?sst\.gif[\s\S]*?>/gi);
    console.log("sst.gif img tag:", imgMatches);
    
    // Print any script tags that might contain data
    const scriptMatches = html.match(/<script[\s\S]*?>[\s\S]*?<\/script>/gi);
    if (scriptMatches) {
        console.log("Script tags count:", scriptMatches.length);
        scriptMatches.forEach((s, idx) => {
            if (s.includes('Array') || s.includes('var') || s.includes('points')) {
                console.log(`Script ${idx} (potential data):`, s.slice(0, 500));
            }
        });
    }
}

run();
