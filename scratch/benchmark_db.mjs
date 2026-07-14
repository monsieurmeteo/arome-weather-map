import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testIndex() {
    console.log('Testing station_id index...');
    const start = Date.now();
    const { data, error } = await supabase
        .from('observations_6mn')
        .select('station_id, timestamp')
        .eq('station_id', '59178001')
        .limit(1);
        
    const end = Date.now();
    if (error) console.error('Error:', error.message);
    else console.log('✅ Success! Time:', (end - start), 'ms', 'Data:', data);
    
    console.log('\nTesting timestamp index...');
    const start2 = Date.now();
    const { data: data2, error: error2 } = await supabase
        .from('observations_6mn')
        .select('station_id, timestamp')
        .order('timestamp', { ascending: false })
        .limit(1);
    const end2 = Date.now();
    if (error2) console.error('Error:', error2.message);
    else console.log('✅ Success! Time:', (end2 - start2), 'ms', 'Data:', data2);
}

testIndex();
