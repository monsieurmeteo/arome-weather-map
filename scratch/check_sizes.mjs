import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSizes() {
    console.log('Checking table sizes...');
    const { data, error } = await supabase.rpc('get_table_sizes');
    
    if (error) {
        console.log('RPC get_table_sizes not found. Trying fallback...');
        // We can't run raw SQL via supabase-js client without a specific RPC.
        // I'll check if there's any RPC I can use.
    } else {
        console.log('Table Sizes:', data);
    }
}

checkSizes();
