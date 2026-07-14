import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCount() {
    const { count, error } = await supabase
        .from('observations_6mn')
        .select('*', { count: 'exact', head: true });
        
    if (error) console.error('Error:', error.message);
    else console.log('Total Rows:', count);
}

checkCount();
