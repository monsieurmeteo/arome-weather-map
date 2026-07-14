import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function stationChunkedDelete() {
    console.log('--- STARTING STATION-CHUNKED DELETE ---');
    
    // Get list of station ids
    const { data: stations, error: stErr } = await supabase
        .from('observations_6mn')
        .select('station_id')
        .limit(1000); // Get some ids
        
    if (stErr) {
        console.error('Error fetching ids:', stErr.message);
        return;
    }
    
    const uniqueIds = [...new Set(stations.map(s => s.station_id))];
    console.log(`Found ${uniqueIds.length} unique station IDs to process in this batch.`);
    
    const BATCH_SIZE = 10;
    for (let i = 0; i < uniqueIds.length; i += BATCH_SIZE) {
        const batch = uniqueIds.slice(i, i + BATCH_SIZE);
        console.log(`Deleting data for stations: ${batch.join(', ')}...`);
        
        const { error } = await supabase
            .from('observations_6mn')
            .delete()
            .in('station_id', batch);
            
        if (error) console.error(`❌ Failed for batch ${i}:`, error.message);
        else console.log(`✅ Success for batch ${i}`);
    }
}

stationChunkedDelete();
