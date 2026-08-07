import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function fastImport() {
    console.log("🚀 Démarrage de l'importation ultra-rapide...");

    // 1. Charger la liste des stations à boucher (manquantes ou incomplètes)
    let gapStations = new Set();
    try {
        const auditContent = fs.readFileSync('./tmp/audit_qualite_reel.md', 'utf8');
        const auditLines = auditContent.split('\n');
        for (const line of auditLines) {
            if (line.includes('|') && line.includes('`')) {
                const parts = line.split('|');
                if (parts.length < 5) continue;
                const id = parts[2].trim().replace(/`/g, '');
                const coverageRR = parts[4];
                // On cible tout ce qui n'est pas parfait (✅) ou proche du parfait
                if (!coverageRR.includes('✅') || coverageRR.includes('⚡')) {
                    gapStations.add(id);
                }
            }
        }
        console.log(`📡 Stations identifiées comme lacunaires : ${gapStations.size}`);
    } catch (e) {
        console.log("⚠️ Audit non trouvé, importation filtrée par ID (8 chiffres).");
    }

    // Chauny est obligatoire
    gapStations.add('02173002');

    // 2. Parser le CSV ligne par ligne (plus léger en mémoire)
    console.log("📄 Lecture du fichier meteo_cleaned.csv...");
    const csvContent = fs.readFileSync('meteo_cleaned.csv', 'utf8');
    const lines = csvContent.split('\n');
    const header = lines[0].trim().split(';');

    const toUpsert = [];
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const vals = line.split(';');

        let sid = vals[0].trim();
        if (sid.length === 3) continue;
        if (sid.length === 7) sid = '0' + sid;
        if (sid.length !== 8) continue;

        // On ne met à jour QUE si c'est une station avec des manques
        if (gapStations.size > 0 && !gapStations.has(sid)) {
            skipped++;
            continue;
        }

        const r = {};
        header.forEach((h, idx) => r[h.trim()] = vals[idx]?.trim() || '');

        toUpsert.push({
            station_id: sid,
            date: r.DATE,
            rain_total: r.RR === '' ? null : parseFloat(r.RR.replace(',', '.')),
            temp_min: r.TN === '' ? null : parseFloat(r.TN.replace(',', '.')),
            temp_max: r.TX === '' ? null : parseFloat(r.TX.replace(',', '.')),
            wind_gust_max: r.FXI === '' ? null : parseFloat(r.FXI.replace(',', '.')),
            updated_at: new Date().toISOString()
        });
    }

    console.log(`📦 Préparation : ${toUpsert.length} lignes à insérer, ${skipped} stations déjà complètes ignorées.`);

    // 3. Batching massif (1000 par 1000) pour aller vite
    const BATCH_SIZE = 1000;
    for (let i = 0; i < toUpsert.length; i += BATCH_SIZE) {
        const batch = toUpsert.slice(i, i + BATCH_SIZE);
        process.stdout.write(`⚡ Envoi batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(toUpsert.length / BATCH_SIZE)}...\r`);

        const { error } = await supabase
            .from('daily_summaries')
            .upsert(batch, { onConflict: 'station_id,date' });

        if (error) {
            console.error(`\n❌ Erreur batch ${i}:`, error.message);
            // Si erreur de timeout, on réessaie avec un batch plus petit
            if (error.message.includes('timeout')) {
                console.log("Tentative de repli sur un batch de 200...");
                for (let j = 0; j < batch.length; j += 200) {
                    await supabase.from('daily_summaries').upsert(batch.slice(j, j + 200), { onConflict: 'station_id,date' });
                }
            }
        }
    }

    console.log("\n✅ Importation terminée !");
}

fastImport();
