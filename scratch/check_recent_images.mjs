import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentImages() {
    const { data } = await supabase.storage.from('vigilance-captures').list();
    
    console.log('--- RECENT VIGILANCE IMAGES ---');
    const recent = data
        .filter(f => f.name.startsWith('vigilance_'))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
        
    recent.forEach(f => {
        console.log(`${f.name} | Created: ${f.created_at} | Size: ${f.metadata?.size}`);
    });
}

checkRecentImages();
