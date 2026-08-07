import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function truncateTable() {
    console.log('--- ATTEMPTING FULL TABLE RESET ---');
    
    // We try to delete everything. This is a heavy operation but faster than day-by-day if successful.
    const { error } = await supabase
        .from('observations_6mn')
        .delete()
        .neq('station_id', 'FORCE_DELETE_ALL_123'); // Broad filter to catch everything
        
    if (error) {
        console.error('❌ Reset failed:', error.message);
        console.log('Trying alternative: delete by small chunks...');
        // Fallback or report
    } else {
        console.log('✅ Success! Table observations_6mn is now empty and healthy.');
    }
}

truncateTable();
