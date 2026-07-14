async function run() {
    const res = await fetch('https://www.meteociel.fr/observations-meteo/temperature-de-la-mer.php', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
    });
    const html = await res.text();
    
    // Find first occurrence of '<area'
    const index = html.indexOf('<area');
    if (index !== -1) {
        console.log("Raw HTML snippet starting at first <area on main page:");
        console.log(html.slice(index, index + 500));
    } else {
        console.log("No <area tags found on main page.");
    }
}
run();
