// Native fetch used
async function run() {
    const res = await fetch('https://www.meteociel.fr/observations-meteo/temperature-de-la-mer.php', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
    });
    const html = await res.text();
    
    // Check if there are tables
    const tableMatches = html.match(/<table[\s\S]*?<\/table>/gi);
    console.log("Tables found:", tableMatches?.length || 0);
    if (tableMatches) {
        tableMatches.forEach((t, idx) => {
            console.log(`Table ${idx} snippet:`, t.slice(0, 1000).replace(/\s+/g, ' '));
        });
    }
}
run();
