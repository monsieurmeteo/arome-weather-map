import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImages() {
    console.log('Checking Supabase Storage for vigilance images...');
    const { data, error } = await supabase.storage
        .from('vigilance-captures')
        .list();
        
    if (error) {
        console.error('Error listing bucket:', error.message);
    } else {
        console.log(`Found ${data.length} files in 'vigilance-captures' bucket.`);
        data.slice(0, 5).forEach(f => console.log(` - ${f.name} (Size: ${f.metadata?.size} bytes, Created: ${f.created_at})`));
        
        const testFile = 'vigilance_france_today.png';
        const exists = data.find(f => f.name === testFile);
        if (exists) {
            const { data: urlData } = supabase.storage.from('vigilance-captures').getPublicUrl(testFile);
            console.log(`\nPublic URL for testing: ${urlData.publicUrl}`);
        } else {
            console.log(`\n❌ Warning: ${testFile} is MISSING. The generation script might be broken.`);
        }
    }
}

checkImages();
