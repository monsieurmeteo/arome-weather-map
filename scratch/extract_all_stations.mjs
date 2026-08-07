async function run() {
    const res = await fetch('https://www.meteociel.fr/observations-meteo/temperature-de-la-mer.php?mode=3', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
    });
    const html = await res.text();
    
    const regex = /<area[^>]*onmouseover="pop\('([^']*)',\s*'([^']*)'[^>]*coords="([^"]*)"[^>]*href='([^']*)'/gi;
    let match;
    const stations = [];
    
    while ((match = regex.exec(html)) !== null) {
        const [_, time, tooltip, coords, href] = match;
        // Tooltip is like "Bateau 9HA4777<hr>Temp&eacute;rature mer : <i>24&deg;C</i>"
        const nameMatch = tooltip.match(/^([^<]+)/);
        const tempMatch = tooltip.match(/Temp&eacute;rature mer : <i>([^<]+)<\/i>/i);
        
        stations.push({
            time,
            name: nameMatch ? nameMatch[1] : tooltip,
            temp: tempMatch ? tempMatch[1] : null,
            coords,
            href
        });
    }
    
    console.log("Total stations found:", stations.length);
    console.log("Unique stations:");
    const unique = {};
    stations.forEach(s => {
        const code = s.href.match(/code2=([^&]+)/)?.[1] || s.name;
        unique[code] = { name: s.name, coords: s.coords, last_temp: s.temp };
    });
    console.log(JSON.stringify(unique, null, 2));
}
run();
