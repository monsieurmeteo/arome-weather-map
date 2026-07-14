async function run() {
    const res = await fetch('https://www.meteociel.fr/observations-meteo/temperature-de-la-mer.php?mode=3', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
    });
    const html = await res.text();
    console.log("HTML length:", html.length);
    
    // Look for area tags or links or coordinates
    const areaMatches = html.match(/<area[\s\S]*?>/gi);
    if (areaMatches) {
        console.log("Found areas:", areaMatches.length);
        console.log("Sample full areas:");
        areaMatches.slice(0, 10).forEach((a, i) => console.log(`Area ${i}:`, a));
    } else {
        console.log("No area tags found in mode=3.");
    }
    
    const tableMatches = html.match(/<table[\s\S]*?<\/table>/gi);
    console.log("Tables found in mode 3:", tableMatches?.length || 0);
    if (tableMatches) {
        tableMatches.forEach((t, idx) => {
            if (t.includes('°C') || t.includes('Bouée') || t.includes('°')) {
                console.log(`Table ${idx} snippet (contains degrees):`, t.slice(0, 1000).replace(/\s+/g, ' '));
            }
        });
    }
}
run();
