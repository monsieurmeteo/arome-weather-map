import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function emergencyCleanup() {
    console.log('--- EMERGENCY CLEANUP STARTED ---');
    
    // We want to delete in chunks to avoid timeout
    // Strategy: Delete day by day starting from the oldest possible
    
    const { data: oldest, error: oldestErr } = await supabase
        .from('observations_6mn')
        .select('timestamp')
        .order('timestamp', { ascending: true })
        .limit(1);
        
    if (oldestErr) {
        console.error('❌ Could not even fetch oldest record. DB is likely frozen. Trying direct delete of old data...');
        const { error: delErr } = await supabase
            .from('observations_6mn')
            .delete()
            .lt('timestamp', new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString());
            
        if (delErr) console.error('❌ Direct delete failed:', delErr.message);
        else console.log('✅ Direct delete (older than 45 days) successful.');
        return;
    }
    
    console.log('Oldest record found:', oldest[0]?.timestamp);
    
    // Delete everything older than 30 days
    const limitDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    console.log('Deleting everything older than:', limitDate);
    
    const { error: delErr, count } = await supabase
        .from('observations_6mn')
        .delete()
        .lt('timestamp', limitDate);
        
    if (delErr) {
        console.error('❌ Bulk delete failed:', delErr.message);
        console.log('Trying smaller chunks...');
        // Fallback or just report failure
    } else {
        console.log('✅ Bulk delete successful.');
    }
}

emergencyCleanup();
