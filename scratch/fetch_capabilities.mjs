async function run() {
    console.log("Fetching EUMETView WMS GetCapabilities...");
    try {
        const res = await fetch("https://view.eumetsat.int/geoserver/wms?service=WMS&version=1.3.0&request=GetCapabilities");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const xml = await res.text();
        
        console.log("Capabilities size:", (xml.length / 1024).toFixed(1), "KB");
        
        // Find all <Name> tags starting with mtg_fd: or msg_fes: or fci:
        const regex = /<Name>([^<]+)<\/Name>/g;
        let match;
        const layers = new Set();
        while ((match = regex.exec(xml)) !== null) {
            layers.add(match[1]);
        }
        
        console.log("\nFound layers:");
        const sorted = Array.from(layers).sort();
        for (const layer of sorted) {
            if (layer.startsWith("mtg_fd:") || layer.startsWith("msg_fes:") || layer.startsWith("mumi:") || layer.startsWith("fci:")) {
                // Find the parent's title (approximate)
                const index = xml.indexOf(`<Name>${layer}</Name>`);
                let title = "";
                if (index !== -1) {
                    const block = xml.substring(index, index + 1000);
                    const titleMatch = /<Title>([^<]+)<\/Title>/.exec(block);
                    if (titleMatch) title = titleMatch[1];
                }
                console.log(`- \x1b[36m${layer}\x1b[0m : ${title}`);
            }
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
