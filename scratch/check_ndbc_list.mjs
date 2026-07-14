async function run() {
    try {
        const res = await fetch('https://www.ndbc.noaa.gov/data/latest_obs/latest_obs.txt');
        const text = await res.text();
        console.log("NDBC file length:", text.length);
        const lines = text.split('\n');
        console.log("Total lines in NDBC file:", lines.length);
        
        // Let's search for some of our stations: '62050', '6100001', '9HA4777'
        const targets = ['62050', '6100001', '9HA4777', '62103'];
        targets.forEach(t => {
            const found = lines.filter(l => l.includes(t));
            console.log(`Searching for '${t}':`, found);
        });
        
        // Print first 5 lines of the file to see the format
        console.log("First 5 lines:");
        console.log(lines.slice(0, 5).join('\n'));
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
