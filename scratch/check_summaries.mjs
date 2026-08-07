import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSummaries() {
    console.log('Checking daily_summaries...');
    const { data, error } = await supabase
        .from('daily_summaries')
        .select('station_id, date, temp_max')
        .order('date', { ascending: false })
        .limit(5);
        
    if (error) console.error('❌ Error:', error.message);
    else console.log('✅ Success:', data);
}

checkSummaries();
