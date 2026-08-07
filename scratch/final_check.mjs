import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatus() {
    console.log('--- FINAL HEALTH CHECK ---');
    
    // Check if table is being populated
    const { data, error, count } = await supabase
        .from('observations_6mn')
        .select('*', { count: 'exact', head: false })
        .order('timestamp', { ascending: false })
        .limit(1);
        
    if (error) {
        console.error('❌ DB still struggling:', error.message);
    } else {
        console.log(`✅ DB is healthy. Row count: ${count}`);
        if (data && data.length > 0) {
            console.log('🚀 Collection RESTARTED! Latest data from:', data[0].timestamp);
        } else {
            console.log('⏳ DB is empty but responsive. Waiting for collector to push data (can take 1-2 mins).');
        }
    }
}

checkStatus();
