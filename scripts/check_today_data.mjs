
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const today = new Date().toISOString().split('T')[0];
    console.log("Checking data for today:", today);
    
    const { data, count, error } = await supabase
        .from('observations_6mn')
        .select('timestamp', { count: 'exact' })
        .gte('timestamp', `${today}T00:00:00Z`)
        .lt('timestamp', `${today}T23:59:59Z`)
        .order('timestamp', { ascending: true })
        .limit(10);
        
    if (error) {
        console.error("Error:", error);
        return;
    }
    
    console.log("Total records today:", count);
    console.log("First 10 records:", data);
}

check();
