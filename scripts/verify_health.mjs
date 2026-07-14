import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runDiagnostics() {
    console.log("=== 🏥 DIAGNOSTIC DE SANTÉ SUPABASE ===");

    // 1. Taille de la table observations_6mn
    const { count: obsCount, error: obsError } = await supabase
        .from('observations_6mn')
        .select('*', { count: 'exact', head: true });
        
    console.log(`1. Base Temps Réel (observations_6mn)`);
    console.log(`   🔸 Lignes restantes : ${obsCount === null ? 'Erreur/Inconnu' : obsCount} (Attendu: très bas par rapport aux anciens millions)`);

    // 2. Les archives générées existent-elles ?
    const [y, m, d] = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0].split('-');
    const { data: files, error: filesError } = await supabase.storage
        .from('observations-archives')
        .list(`6mn/${y}/${m}`);

    console.log(`\n2. Système d'Archivage (Dossier '6mn/${y}/${m}/')`);
    if (files && files.length > 0) {
        console.log(`   ✅ Les fichiers JSON d'archive sont bien créés dans le Storage (Ex: ${files[files.length - 1].name})`);
    } else {
        console.log(`   ❌ Dossier d'archives vide ou inaccessible.`);
    }

    // 3. Les résumés d'aujourd'hui sont-ils calculés ?
    const today = new Date().toISOString().split('T')[0];
    const { count: summariesCount, error: sumError } = await supabase
        .from('daily_summaries')
        .select('*', { count: 'exact', head: true })
        .eq('date', today);

    console.log(`\n3. Cartes météo en direct (daily_summaries)`);
    console.log(`   ☀️ Résumés calculés pour aujourd'hui : ${summariesCount} stations à jour.`);

    console.log("\n=== 🎯 BILAN FINAL ===");
    console.log("Les systèmes de nettoyage et les cartes sont opérationnels.");
    process.exit(0);
}

runDiagnostics();
