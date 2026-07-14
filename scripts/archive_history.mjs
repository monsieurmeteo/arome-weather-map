import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runCatchup() {
    console.log("🚀 Lancement de l'archivage historique vers Storage...");
    
    // On remonte les 30 derniers jours
    for (let i = 1; i <= 30; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        console.log(`\n📅 Traitement du ${date}...`);
        
        try {
            // Appeler directement l'Edge Function d'archivage (via HTTP)
            const { data, error } = await supabase.functions.invoke('archive-daily-data', {
                body: { date }
            });
            
            if (error) {
                console.error(`❌ Erreur pour ${date}:`, error);
            } else {
                console.log(`✅ Succès pour ${date}: ${data.rows} lignes archivées.`);
            }
        } catch (e) {
            console.error(`💥 Crash pour ${date}:`, e.message);
        }
    }
    
    console.log("\n✨ Archivage terminé.");
}

runCatchup();
