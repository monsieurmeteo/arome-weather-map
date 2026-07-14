import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const supabaseKey = 'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnostic() {
    console.log('--- DB Diagnostic ---');
    
    // 1. Test query with index
    console.log('Testing indexed query for Douai today...');
    const now = new Date();
    const today = now.toISOString().split('T')[0] + 'T00:00:00Z';
    
    const { data, error, status } = await supabase
        .from('observations_6mn')
        .select('station_id, timestamp, t')
        .eq('station_id', '59178001') // Douai
        .gte('timestamp', today)
        .order('timestamp', { ascending: false })
        .limit(1);
        
    if (error) {
        console.error('❌ Indexed query failed:', error.message);
    } else {
        console.log('✅ Indexed query success (Status ' + status + '):', data);
    }
    
    // 2. Test count estimate
    console.log('\nFetching table size estimate...');
    const { data: countData, error: countError } = await supabase.rpc('get_table_count_estimate', { table_name: 'observations_6mn' });
    // If RPC doesn't exist, we try a simple count with timeout risk
    if (countError) {
        console.log('RPC get_table_count_estimate not found, trying head count...');
        const { count, error: headError } = await supabase
            .from('observations_6mn')
            .select('*', { count: 'estimated', head: true });
        if (headError) console.error('❌ Count failed:', headError.message);
        else console.log('✅ Estimated count:', count);
    } else {
        console.log('✅ RPC Estimate:', countData);
    }
}

diagnostic();
