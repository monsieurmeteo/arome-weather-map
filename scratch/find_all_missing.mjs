import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabase = createClient(
    'https://ubdevaemtwbzxksjlhjg.supabase.co',
    'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR'
);

const stationNames = JSON.parse(readFileSync('c:\\Users\\grego\\Documents\\minisite-douai\\src\\data\\stationNames.json', 'utf8'));
const knownIds = new Set(Object.keys(stationNames));

async function findAllMissing() {
    console.log('=== SCAN COMPLET DES STATIONS MANQUANTES ===\n');

    let allIds = new Set();
    let from = 0;
    const batch = 1000;

    // Scan complet paginé de daily_summaries
    while (true) {
        const { data, error } = await supabase
            .from('daily_summaries')
            .select('station_id')
            .range(from, from + batch - 1);

        if (error || !data || data.length === 0) break;
        data.forEach(r => allIds.add(String(r.station_id)));
        if (data.length < batch) break;
        from += batch;
    }

    console.log(`Total IDs distincts en base : ${allIds.size}`);

    const missing = [...allIds].filter(id => {
        const prefix = parseInt(id.substring(0, 2));
        if (prefix >= 97 || prefix === 0 || id.length !== 8) return false;
        return !knownIds.has(id);
    });

    console.log(`Stations métropole SANS nom : ${missing.length}\n`);
    if (missing.length > 0) {
        console.log('Entrées à ajouter dans stationNames.json :');
        missing.forEach(id => console.log(`  "${id}": "???",`));
    }
}

findAllMissing();
