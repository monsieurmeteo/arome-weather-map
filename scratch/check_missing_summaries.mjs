import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMissingDays() {
    console.log('Checking daily_summaries for missing days (April 26-30)...');
    const { data, error } = await supabase
        .from('daily_summaries')
        .select('date')
        .gte('date', '2026-04-25')
        .order('date', { ascending: true });
        
    if (error) {
        console.error('Error:', error.message);
    } else {
        const dates = data.map(d => d.date);
        const uniqueDates = [...new Set(dates)];
        console.log('Dates present in summaries:', uniqueDates);
        
        const allRequired = ['2026-04-26', '2026-04-27', '2026-04-28', '2026-04-29', '2026-04-30'];
        const missing = allRequired.filter(d => !uniqueDates.includes(d));
        console.log('Missing days in summaries:', missing);
    }
}

checkMissingDays();
