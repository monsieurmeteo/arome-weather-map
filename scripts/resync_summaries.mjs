import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function resyncSummaries() {
    console.log("🔄 Recalcul des résumés quotidiens avec la nouvelle méthode légère...");
    
    // On relance pour aujourd'hui et hier au cas où
    for (let i = 0; i <= 2; i++) {
        const targetDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        console.log(`📅 Synchronisation pour le ${targetDate}...`);
        
        try {
            const { error } = await supabase.rpc('batch_sync_daily_summaries', { target_date: targetDate });
            if (error) {
                console.error(`❌ Erreur pour ${targetDate}:`, error.message);
            } else {
                console.log(`✅ Succès pour ${targetDate}`);
            }
        } catch (e) {
            console.error(`💥 Exception pour ${targetDate}:`, e.message);
        }
    }
    
    console.log("✨ Synchronisation terminée.");
}

resyncSummaries();
