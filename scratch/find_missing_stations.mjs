import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
    'https://ubdevaemtwbzxksjlhjg.supabase.co',
    'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR'
);

// Lire le fichier JSON local
const stationNames = JSON.parse(readFileSync('c:\\Users\\grego\\Documents\\minisite-douai\\src\\data\\stationNames.json', 'utf8'));
const knownIds = new Set(Object.keys(stationNames));

async function findMissingStations() {
    console.log(`Stations dans stationNames.json : ${knownIds.size}`);

    // Récupérer les IDs distincts depuis daily_summaries
    const { data, error } = await supabase
        .from('daily_summaries')
        .select('station_id')
        .limit(5000);

    if (error) { console.error(error); return; }

    const dbIds = new Set(data.map(r => String(r.station_id)));
    console.log(`Stations distinctes en base : ${dbIds.size}`);

    const missing = [...dbIds].filter(id => {
        // Métropole uniquement (01-95)
        const prefix = parseInt(id.substring(0, 2));
        if (prefix >= 97 || prefix === 0 || id.length !== 8) return false;
        return !knownIds.has(id);
    });

    console.log(`\nStations SANS nom (${missing.length}) :`);
    missing.slice(0, 20).forEach(id => console.log(`  "${id}": "",`));
    if (missing.length > 20) console.log(`  ... et ${missing.length - 20} autres`);
}

findMissingStations();
