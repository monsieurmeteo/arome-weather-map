import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatus() {
    console.log("--- Supabase Status Check ---");
    console.log("URL:", supabaseUrl);
    
    // 1. Check observations_6mn
    const { data: latestObs, error: obsErr } = await supabase
        .from('observations_6mn')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1);
    
    if (obsErr) {
        console.error("Error fetching observations_6mn:", obsErr.message);
    } else if (latestObs.length > 0) {
        console.log("Latest observation (6mn):", latestObs[0].timestamp);
    } else {
        console.log("observations_6mn table is empty.");
    }

    // 2. Check daily_summaries
    const { data: latestSummary, error: sumErr } = await supabase
        .from('daily_summaries')
        .select('date')
        .order('date', { ascending: false })
        .limit(1);
    
    if (sumErr) {
        console.error("Error fetching daily_summaries:", sumErr.message);
    } else if (latestSummary.length > 0) {
        console.log("Latest daily summary date:", latestSummary[0].date);
    } else {
        console.log("daily_summaries table is empty.");
    }

    // 3. Check secrets
    const { data: tokenSecret, error: secErr } = await supabase
        .from('secrets')
        .select('updated_at')
        .eq('name', 'meteo_token');
    
    if (secErr) {
        console.error("Error fetching secrets:", secErr.message);
    } else if (tokenSecret.length > 0) {
        console.log("Meteo token last updated:", tokenSecret[0].updated_at);
    } else {
        console.log("meteo_token secret not found.");
    }

    // 4. Count observations_6mn rows (approx)
    const { count, error: countErr } = await supabase
        .from('observations_6mn')
        .select('*', { count: 'estimated', head: true });
    
    if (countErr) {
        console.error("Error counting observations_6mn:", countErr.message);
    } else {
        console.log("Approximate rows in observations_6mn:", count);
    }
}

checkStatus();
