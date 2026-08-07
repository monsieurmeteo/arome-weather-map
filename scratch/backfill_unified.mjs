/**
 * Backfill : génère les fichiers unifiés YYYY-MM-DD.json
 * pour tous les jours déjà archivés en slices.
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { Buffer } from 'buffer';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
const SLICES = ['00-06', '06-12', '12-18', '18-00'];

// Lister tous les dossiers années dans 6mn/
const { data: years } = await sb.storage.from('observations-archives').list('6mn');
if (!years || years.length === 0) { console.log('Aucune archive trouvée.'); process.exit(0); }

let totalDone = 0, totalSkipped = 0, totalFailed = 0;

for (const yearDir of years) {
    const y = yearDir.name;
    const { data: months } = await sb.storage.from('observations-archives').list(`6mn/${y}`);
    if (!months) continue;

    for (const monthDir of months) {
        const m = monthDir.name;
        const { data: days } = await sb.storage.from('observations-archives').list(`6mn/${y}/${m}`);
        if (!days) continue;

        for (const dayEntry of days) {
            // Ignorer les fichiers .json déjà unifiés (pas des dossiers)
            if (dayEntry.name.endsWith('.json')) {
                console.log(`  ⏭️  ${y}-${m}-${dayEntry.name.replace('.json','')} — fichier unifié déjà présent`);
                totalSkipped++;
                continue;
            }

            const d = dayEntry.name;
            const dateStr = `${y}-${m}-${d}`;
            console.log(`\n📅 Traitement ${dateStr}...`);

            let allObs = [];
            let sliceCount = 0;

            for (const sliceId of SLICES) {
                const slicePath = `6mn/${y}/${m}/${d}/${sliceId}.json`;
                const { data, error } = await sb.storage.from('observations-archives').download(slicePath);
                if (!error && data) {
                    try {
                        const text = await data.text();
                        const parsed = JSON.parse(text);
                        allObs = allObs.concat(parsed);
                        sliceCount++;
                        process.stdout.write(`  ✅ ${sliceId}: ${parsed.length} obs\n`);
                    } catch(e) {
                        process.stdout.write(`  ⚠️  ${sliceId}: parse error\n`);
                    }
                } else {
                    process.stdout.write(`  ➖ ${sliceId}: absent\n`);
                }
            }

            if (allObs.length === 0) {
                console.log(`  ℹ️  Aucune obs pour ${dateStr}, ignoré.`);
                totalSkipped++;
                continue;
            }

            const unifiedPath = `6mn/${y}/${m}/${d}.json`;
            const { error: uploadErr } = await sb.storage
                .from('observations-archives')
                .upload(unifiedPath, Buffer.from(JSON.stringify(allObs)), {
                    contentType: 'application/json',
                    upsert: true
                });

            if (uploadErr) {
                console.log(`  ❌ Erreur upload ${unifiedPath}: ${uploadErr.message}`);
                totalFailed++;
            } else {
                console.log(`  ✅ Fichier unifié créé: ${unifiedPath} (${allObs.length} obs total)`);
                totalDone++;
            }
        }
    }
}

console.log(`\n══════════════════════════════════`);
console.log(`✅ Créés     : ${totalDone}`);
console.log(`⏭️  Déjà présents: ${totalSkipped}`);
console.log(`❌ Erreurs   : ${totalFailed}`);
console.log(`══════════════════════════════════\n`);
