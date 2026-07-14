import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('[CRON ARCHIVE] ❌ Variables Supabase manquantes !');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runCronArchive() {
    console.log(`[CRON ARCHIVE] Démarrage — ${new Date().toISOString()}\n`);

    try {
        const { data: oldestData, error: oldestError } = await supabase
            .from('observations_6mn')
            .select('timestamp')
            .order('timestamp', { ascending: true })
            .limit(1);

        if (oldestError) throw oldestError;
        if (!oldestData || oldestData.length === 0) {
            console.log("[CRON ARCHIVE] La table est vide. Rien à faire.");
            return;
        }

        const oldestDate = new Date(oldestData[0].timestamp);
        const stopDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // Seuil à J-1 (24h) au lieu de J-2

        console.log(`[CRON ARCHIVE] Plus vieux record : ${oldestDate.toISOString()}`);
        console.log(`[CRON ARCHIVE] Seuil d'archivage (J-2) : ${stopDate.toISOString()}`);

        let currentDate = new Date(oldestDate);
        currentDate.setUTCHours(0, 0, 0, 0);

        while (currentDate < stopDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            console.log(`\n[CRON ARCHIVE] Traitement de la journée : ${dateStr}`);
            
            // On traite la journée par tranches de 6h pour éviter les fichiers trop gros (>50Mo)
            const SLICES = [
                { id: '00-06', start: '00:00:00Z', end: '05:59:59Z' },
                { id: '06-12', start: '06:00:00Z', end: '11:59:59Z' },
                { id: '12-18', start: '12:00:00Z', end: '17:59:59Z' },
                { id: '18-00', start: '18:00:00Z', end: '23:59:59Z' }
            ];

            let daySuccess = true;
            for (const slice of SLICES) {
                const success = await archiveSlice(dateStr, slice);
                if (!success) daySuccess = false;
            }

            if (daySuccess) {
                console.log(`   ✅ Journée ${dateStr} entièrement archivée en slices.`);
                // Générer le fichier unifié journalier pour accélèrer le chargement frontend
                await generateUnifiedDayFile(dateStr, SLICES);
                await cleanupDaySQL(dateStr);
            }

            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        console.log(`\n[CRON ARCHIVE] ✅ TERMINÉ.`);
    } catch (err) {
        console.error('\n[CRON ARCHIVE] ❌ ERREUR FATALE:', err.message || err);
        process.exit(1);
    }
}

async function archiveSlice(targetDate, slice) {
    console.log(`   -> Archivage tranche ${slice.id}h (${slice.start} - ${slice.end})...`);
    
    // 1. Fetch data
    const BATCH_SIZE = 1000;
    let from = 0;
    let hasMore = true;
    let totalRows = 0;
    
    const tempFilePath = path.join(process.cwd(), `temp_archive_${targetDate}_${slice.id}.json`);
    const writeStream = fs.createWriteStream(tempFilePath);
    writeStream.write('[');
    let isFirst = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('observations_6mn')
            .select('*')
            .gte('timestamp', `${targetDate}T${slice.start}`)
            .lte('timestamp', `${targetDate}T${slice.end}`)
            .range(from, from + BATCH_SIZE - 1)
            .order('timestamp', { ascending: true });

        if (error) {
            fs.unlinkSync(tempFilePath);
            throw error;
        }
        
        if (data && data.length > 0) {
            for (const row of data) {
                if (!isFirst) writeStream.write(',');
                writeStream.write(JSON.stringify(row));
                isFirst = false;
            }
            totalRows += data.length;
            if (data.length < BATCH_SIZE) hasMore = false;
            else from += BATCH_SIZE;
        } else {
            hasMore = false;
        }
    }
    
    writeStream.write(']');
    writeStream.end();

    await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });

    if (totalRows > 0) {
        console.log(`      ✅ ${totalRows} lignes trouvées. Upload...`);
        const [y, m, d] = targetDate.split('-');
        const filePath = `6mn/${y}/${m}/${d}/${slice.id}.json`;
        
        const fileBuffer = fs.readFileSync(tempFilePath);
        const { error: uploadError } = await supabase.storage
            .from('observations-archives')
            .upload(filePath, fileBuffer, { contentType: 'application/json', upsert: true });

        if (uploadError) {
            fs.unlinkSync(tempFilePath);
            throw uploadError;
        }
    } else {
        console.log(`      ℹ️ Aucune donnée pour cette tranche.`);
    }

    if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
    }
    return true;
}

async function generateUnifiedDayFile(targetDate, slices) {
    console.log(`   -> Génération du fichier unifié ${targetDate}.json...`);
    const [y, m, d] = targetDate.split('-');
    let allObs = [];

    for (const slice of slices) {
        const slicePath = `6mn/${y}/${m}/${d}/${slice.id}.json`;
        const { data, error } = await supabase.storage.from('observations-archives').download(slicePath);
        if (!error && data) {
            try {
                const text = await data.text();
                const parsed = JSON.parse(text);
                allObs = allObs.concat(parsed);
            } catch (e) {
                console.warn(`      ⚠️ Impossible de parser ${slicePath}: ${e.message}`);
            }
        }
    }

    if (allObs.length === 0) {
        console.log(`      ℹ️ Aucune donnée pour le fichier unifié de ${targetDate}.`);
        return;
    }

    const unifiedJson = JSON.stringify(allObs);
    const unifiedPath = `6mn/${y}/${m}/${d}.json`;
    const { error: uploadError } = await supabase.storage
        .from('observations-archives')
        .upload(unifiedPath, Buffer.from(unifiedJson), { contentType: 'application/json', upsert: true });

    if (uploadError) {
        console.warn(`      ⚠️ Erreur upload fichier unifié: ${uploadError.message}`);
    } else {
        console.log(`      ✅ Fichier unifié uploadé: ${unifiedPath} (${allObs.length} obs)`);
    }
}

async function cleanupDaySQL(targetDate) {
    console.log(`   -> Nettoyage SQL pour le ${targetDate}...`);
    for (let hour = 0; hour < 24; hour += 2) {
        const hStart = `${hour.toString().padStart(2, '0')}:00:00Z`;
        const hEnd = `${(hour + 2).toString().padStart(2, '0')}:00:00Z`;
        
        const { error: deleteError } = await supabase
            .from('observations_6mn')
            .delete()
            .gte('timestamp', `${targetDate}T${hStart}`)
            .lt('timestamp', `${targetDate}T${hEnd}`);
            
        if (deleteError) {
            console.error(`      ❌ Erreur suppression tranche ${hStart}-${hEnd}`);
            throw deleteError;
        }
    }
}

runCronArchive();
