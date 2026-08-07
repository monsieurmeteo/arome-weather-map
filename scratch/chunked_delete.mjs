import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function chunkedDelete() {
    console.log('--- STARTING CHUNKED DELETE (Day by Day) ---');
    
    const days = [
        '2026-04-25',
        '2026-04-26',
        '2026-04-27',
        '2026-04-28',
        '2026-04-29'
    ];
    
    for (const day of days) {
        console.log(`Processing ${day}...`);
        const start = `${day}T00:00:00Z`;
        const end = `${day}T23:59:59Z`;
        
        const { error } = await supabase
            .from('observations_6mn')
            .delete()
            .gte('timestamp', start)
            .lte('timestamp', end);
            
        if (error) console.error(`❌ Failed for ${day}:`, error.message);
        else console.log(`✅ Success for ${day}`);
    }
    
    console.log('--- CHUNKED DELETE FINISHED ---');
}

chunkedDelete();
