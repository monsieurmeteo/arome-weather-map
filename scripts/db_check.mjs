import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function count() {
    console.log("Connecting to:", process.env.VITE_SUPABASE_URL);
    const { count, error } = await supabase
        .from('stations')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Total stations:", count);
    }

    const { data: latestObs, error: obsError } = await supabase
        .from('observations_6mn')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1);

    if (obsError) {
        console.error("Obs Error:", obsError);
    } else {
        console.log("Latest observation:", latestObs[0]?.timestamp);
    }
}

count();
