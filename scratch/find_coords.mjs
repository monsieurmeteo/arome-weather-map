async function run() {
    const res = await fetch('https://www.meteociel.fr/temps-reel/obs_boueebateau.php?code2=62050', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
    });
    const html = await res.text();
    
    // Print lines containing Latitude or Longitude or Altitude (case insensitive)
    const lines = html.split('\n');
    console.log("Matching lines:");
    lines.forEach((line, idx) => {
        if (/latitude|longitude|altitude|position|coordonn/i.test(line)) {
            console.log(`Line ${idx}: ${line.trim()}`);
        }
    });
    
    // Also look for any link to geohash or openstreetmap or google maps
    console.log("Map links:");
    lines.forEach((line, idx) => {
        if (/maps\.google|openstreetmap|map/i.test(line) && line.includes('href')) {
            console.log(`Line ${idx}: ${line.trim()}`);
        }
    });
}
run();
