import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function archiveDay(targetDate) {
    console.log(`📦 Archivage pour : ${targetDate}`);
    const BATCH_SIZE = 10000;
    let allRows = [];
    let from = 0;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('observations_6mn')
            .select('*')
            .gte('timestamp', `${targetDate}T00:00:00Z`)
            .lt('timestamp', `${targetDate}T23:59:59Z`)
            .range(from, from + BATCH_SIZE - 1)
            .order('timestamp', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
            allRows.push(...data);
            if (data.length < BATCH_SIZE) hasMore = false;
            else from += BATCH_SIZE;
        } else {
            hasMore = false;
        }
    }

    if (allRows.length === 0) return 0;

    const [y, m, d] = targetDate.split('-');
    const filePath = `6mn/${y}/${m}/${d}.json`;
    const { error: uploadError } = await supabase.storage
        .from('observations-archives')
        .upload(filePath, JSON.stringify(allRows), { contentType: 'application/json', upsert: true });

    if (uploadError) throw uploadError;

    // Suppression
    const { error: deleteError } = await supabase
        .from('observations_6mn')
        .delete()
        .gte('timestamp', `${targetDate}T00:00:00Z`)
        .lt('timestamp', `${targetDate}T23:59:59Z`);
    
    return allRows.length;
}

async function run() {
    for (let i = 1; i <= 30; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        try {
            const count = await archiveDay(date);
            console.log(`✅ ${date}: ${count} lignes.`);
        } catch (e) {
            console.error(`❌ ${date}: ${e.message}`);
        }
    }
}

run();
