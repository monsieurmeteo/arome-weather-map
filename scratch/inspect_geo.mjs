async function inspectGeo() {
    const res = await fetch("https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson");
    const geo = await res.json();
    
    console.log("--- GEOJSON INSPECTION ---");
    console.log("First feature properties:", JSON.stringify(geo.features[0].properties));
    
    // Check for some sample departments
    const sampleCodes = ['29', '59', '2A', '06'];
    sampleCodes.forEach(code => {
        const found = geo.features.find(f => f.properties.code === code || f.properties.DEP === code || f.properties.id === code);
        if (found) {
            console.log(`Found ${code} with properties:`, JSON.stringify(found.properties));
        } else {
            console.log(`Code ${code} NOT FOUND in properties!`);
        }
    });
}

inspectGeo();
