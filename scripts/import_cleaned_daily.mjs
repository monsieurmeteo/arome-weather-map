import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function importCleanedData() {
    console.log("Reading audit report...");
    let gapStations = new Set();
    try {
        const auditContent = fs.readFileSync('./tmp/audit_qualite_reel.md', 'utf8');
        const auditLines = auditContent.split('\n');
        for (const line of auditLines) {
            if (line.includes('|') && line.includes('`')) {
                const parts = line.split('|');
                if (parts.length < 5) continue;
                const id = parts[2].trim().replace(/`/g, '');
                const coverageT = parts[3];
                const coverageRR = parts[4];
                if (coverageT.includes('⚡') || coverageT.includes('⚠️') || coverageT.includes('❌') ||
                    coverageRR.includes('⚡') || coverageRR.includes('⚠️') || coverageRR.includes('❌')) {
                    gapStations.add(id);
                }
            }
        }
        console.log(`Found ${gapStations.size} gap stations.`);
    } catch (e) {
        console.log("Could not find audit report, will proceed with all stations from CSV.");
    }

    // Always include Chauny just in case
    gapStations.add('02173002');

    console.log("Parsing meteo_cleaned.csv...");
    const csvContent = fs.readFileSync('meteo_cleaned.csv', 'utf8');
    const lines = csvContent.split('\n');
    const headerLine = lines[0].trim();
    const header = headerLine.split(';');

    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const vals = line.split(';');
        const r = {};
        header.forEach((h, idx) => {
            const head = h.trim();
            r[head] = vals[idx] ? vals[idx].trim() : '';
        });
        records.push(r);
    }
    console.log(`Processing ${records.length} records.`);

    const toUpdate = [];
    for (const r of records) {
        let sid = r.POSTE;
        if (!sid) continue;
        if (sid.length === 3) continue;
        if (sid.length === 7) sid = '0' + sid;
        if (sid.length !== 8) continue;

        // Skip if not a gap station (unless we don't have a gap list)
        if (gapStations.size > 0 && !gapStations.has(sid)) continue;

        toUpdate.push({
            station_id: sid,
            date: r.DATE,
            rain_total: r.RR === '' ? null : parseFloat(String(r.RR).replace(',', '.')),
            temp_min: r.TN === '' ? null : parseFloat(String(r.TN).replace(',', '.')),
            temp_max: r.TX === '' ? null : parseFloat(String(r.TX).replace(',', '.')),
            wind_gust_max: r.FXI === '' ? null : parseFloat(String(r.FXI).replace(',', '.')),
            updated_at: new Date().toISOString()
        });
    }

    console.log(`Total to upsert: ${toUpdate.length}`);

    const BATCH_SIZE = 100;
    for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
        const batch = toUpdate.slice(i, i + BATCH_SIZE);
        console.log(`Batch ${i / BATCH_SIZE + 1}/${Math.ceil(toUpdate.length / BATCH_SIZE)} (${i} points)...`);

        try {
            const { error } = await supabase
                .from('daily_summaries')
                .upsert(batch, { onConflict: 'station_id,date' });

            if (error) {
                console.error(`Error in batch ${i}:`, error.message);
            }
        } catch (err) {
            console.error(`Exception in batch ${i}:`, err.message);
        }
        await new Promise(res => setTimeout(res, 50));
    }

    console.log("Import terminé.");
}

importCleanedData();
