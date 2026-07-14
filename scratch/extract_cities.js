const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');

// Match the zoneConfigs block in script
const startMatch = indexContent.indexOf('const zoneConfigs = {');
if (startMatch === -1) {
    console.error("Could not find zoneConfigs in index.html");
    process.exit(1);
}

// Find the matching closing bracket for zoneConfigs
let openBrackets = 1;
let endMatch = -1;
let i = startMatch + 'const zoneConfigs = {'.length;

while (i < indexContent.length) {
    if (indexContent[i] === '{') {
        openBrackets++;
    } else if (indexContent[i] === '}') {
        openBrackets--;
        if (openBrackets === 0) {
            endMatch = i;
            break;
        }
    }
    i++;
}

if (endMatch === -1) {
    console.error("Could not find closing bracket for zoneConfigs");
    process.exit(1);
}

const zoneConfigsStr = indexContent.substring(startMatch, endMatch + 1);

// Safely evaluate the object using a Function constructor (since it is a static configuration object)
const extractConfigs = new Function(`
    ${zoneConfigsStr}
    return zoneConfigs;
`);

try {
    const zoneConfigs = extractConfigs();
    const result = {};

    for (const [key, config] of Object.entries(zoneConfigs)) {
        result[key] = {
            id: config.id,
            name: config.name,
            center: config.center,
            zoom: config.zoom,
            cities: config.cities.map(c => ({
                name: c.name,
                lat: c.lat,
                lon: c.lon
            }))
        };
    }

    const outputPath = path.join(__dirname, '..', 'supabase', 'regional_cities.json');
    
    // Ensure parent directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
    console.log(`Successfully extracted and saved all regional cities to ${outputPath}`);
} catch (e) {
    console.error("Error extracting zoneConfigs:", e);
}
