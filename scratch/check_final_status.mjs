import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFinalStatus() {
    const { data } = await supabase.storage.from('vigilance-captures').list();
    
    const national = data.find(f => f.name === 'vigilance_france_today.png');
    if (national) {
        console.log(`National Map: ${national.name}`);
        console.log(`Last Updated: ${national.created_at}`);
        console.log(`Size: ${national.metadata?.size} bytes`);
    } else {
        console.log('National Map MISSING.');
    }
}

checkFinalStatus();
