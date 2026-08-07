import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFiles() {
    const { data, error } = await supabase.storage.from('vigilance-captures').list();
    if (error) {
        console.error('Error listing files:', error);
        return;
    }

    const targets = ['vigilance_france_today.png', 'vigilance_region_BRE_today.png', 'vigilance_region_COR_today.png'];
    
    console.log('--- STORAGE STATUS ---');
    targets.forEach(name => {
        const f = data.find(file => file.name === name);
        if (f) {
            console.log(`${name}: Updated at ${f.updated_at} (Size: ${f.metadata?.size})`);
        } else {
            console.log(`${name}: NOT FOUND`);
        }
    });
}

checkFiles();
