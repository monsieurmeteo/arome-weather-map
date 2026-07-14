import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDouai() {
    console.log('Checking Douai (59178001)...');
    const { data, error } = await supabase
        .from('observations_6mn')
        .select('timestamp, t')
        .eq('station_id', '59178001')
        .order('timestamp', { ascending: false })
        .limit(5);
        
    if (error) console.error(error.message);
    else console.log('Latest Douai data:', data);
}

checkDouai();
