import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateSiteQuery() {
    console.log('--- SIMULATING SITE QUERY ---');
    const stationId = '59178001';
    
    // Simulate line 25-32 of api.js
    const dateObj = new Date(); // Today
    const start = new Date(dateObj);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateObj);
    end.setHours(23, 59, 59, 999);
    
    console.log(`Querying from ${start.toISOString()} to ${end.toISOString()}`);
    
    const { data, error } = await supabase
        .from('observations_6mn')
        .select('*')
        .eq('station_id', stationId)
        .gte('timestamp', start.toISOString())
        .lte('timestamp', end.toISOString())
        .order('timestamp', { ascending: false })
        .limit(400);
        
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`Found ${data.length} records.`);
        if (data.length > 0) {
            console.log('Latest record in result:', data[0].timestamp);
            console.log('Oldest record in result:', data[data.length - 1].timestamp);
        }
    }
}

simulateSiteQuery();
