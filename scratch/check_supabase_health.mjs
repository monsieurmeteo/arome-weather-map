import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials missing in .env.local!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkHealth() {
    console.log('Checking Supabase observations_6mn table status...\n');

    try {
        // 1. Get Row Count
        const { count, error: countErr } = await supabase
            .from('observations_6mn')
            .select('*', { count: 'exact', head: true });

        if (countErr) throw countErr;
        console.log(`📊 Total rows in 'observations_6mn': ${count}`);

        // 2. Get Oldest Record
        const { data: oldestData, error: oldestErr } = await supabase
            .from('observations_6mn')
            .select('timestamp')
            .order('timestamp', { ascending: true })
            .limit(1);

        if (oldestErr) throw oldestErr;
        const oldestDateStr = oldestData && oldestData.length > 0 ? oldestData[0].timestamp : 'Aucune donnée';
        console.log(`📅 Oldest record timestamp: ${oldestDateStr}`);

        // 3. Get Newest Record
        const { data: newestData, error: newestErr } = await supabase
            .from('observations_6mn')
            .select('timestamp')
            .order('timestamp', { ascending: false })
            .limit(1);

        if (newestErr) throw newestErr;
        const newestDateStr = newestData && newestData.length > 0 ? newestData[0].timestamp : 'Aucune donnée';
        console.log(`📅 Newest record timestamp: ${newestDateStr}`);

        // 4. Verify Retention
        if (oldestData && oldestData.length > 0 && newestData && newestData.length > 0) {
            const oldest = new Date(oldestDateStr);
            const newest = new Date(newestDateStr);
            const diffDays = (newest - oldest) / (1000 * 60 * 60 * 24);
            console.log(`⏳ Retention window in database: ${diffDays.toFixed(2)} days`);
            
            if (diffDays > 2) {
                console.log(`⚠️ Database contains more than 2 days of data. Cleanup routine may not be running or needs to catch up.`);
            } else {
                console.log(`✅ Retention window is within the expected target (<= 2 days). Cleanup is active and working!`);
            }
        }
        
        // 5. Check Bucket archives count/existence
        const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
        if (bucketErr) {
            console.error('❌ Error listing buckets:', bucketErr.message);
        } else {
            console.log('\n🗄️ Storage Buckets:');
            buckets.forEach(b => {
                console.log(` - ${b.name} (Public: ${b.public})`);
            });
        }

    } catch (err) {
        console.error('❌ Diagnostic error:', err.message || err);
    }
}

checkHealth();
