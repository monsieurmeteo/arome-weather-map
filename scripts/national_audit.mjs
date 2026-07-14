import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

const REGIONS = {
    "Auvergne-Rhône-Alpes": ["01", "03", "07", "15", "26", "38", "42", "43", "63", "69", "73", "74"],
    "Bourgogne-Franche-Comté": ["21", "25", "39", "58", "70", "71", "89", "90"],
    "Bretagne": ["22", "29", "35", "56"],
    "Centre-Val de Loire": ["18", "28", "36", "37", "41", "45"],
    "Corse": ["2A", "2B"],
    "Grand Est": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"],
    "Hauts-de-France": ["02", "59", "60", "62", "80"],
    "Île-de-France": ["75", "77", "78", "91", "92", "93", "94", "95"],
    "Normandie": ["14", "27", "50", "61", "76"],
    "Nouvelle-Aquitaine": ["16", "17", "19", "23", "24", "33", "40", "47", "64", "79", "86", "87"],
    "Occitanie": ["09", "11", "12", "30", "31", "32", "34", "46", "48", "65", "66", "81", "82"],
    "Pays de la Loire": ["44", "49", "53", "72", "85"],
    "Provence-Alpes-Côte d'Azur": ["04", "05", "06", "13", "83", "84"],
    "Antilles-Guyane": ["971", "972", "973"],
    "Océan Indien": ["974", "976"],
    "Pacifique / Autres": ["975", "984", "987", "988"]
};

// Map dept to region
const DEPT_TO_REGION = {};
for (const [region, depts] of Object.entries(REGIONS)) {
    depts.forEach(d => DEPT_TO_REGION[d] = region);
}

async function nationalAudit() {
    console.log("Audit National de Couverture (Toutes Régions)...");

    // 1. Fetch all stations
    const { data: stations, error: eS } = await supabase.from('stations').select('id, name');
    if (eS) return console.error(eS);

    const now = new Date();
    const febStart = "2026-02-01T00:00:00Z";
    const febEnd = "2026-02-28T23:59:59Z";
    const marStart = "2026-03-01T00:00:00Z";
    const marEnd = now.toISOString();

    const febExpected = 28 * 24 * 10;
    const marExpected = now.getDate() * 24 * 10;

    console.log(`Analyse de ${stations.length} stations...`);

    // 2. Perform counts grouped by station_id for Feb (using RPC to avoid huge loop if possible)
    // If no RPC, we might have to batch or do multiple calls.
    // Let's try direct count aggregation if possible.

    async function getCounts(start, end) {
        // We use a custom RPC if it exists, but let's assume standard JS for now.
        // Grouped queries are hard in standard Supabase JS without RPC.
        // Let's check if we have get_daily_extremes_full or similar which might help...
        // Actually, let's use the most efficient way: iterate stations in batches.
        const results = {};
        const batchSize = 30;
        for (let i = 0; i < stations.length; i += batchSize) {
            const batch = stations.slice(i, i + batchSize);
            const promises = batch.map(s =>
                supabase
                    .from('observations_6mn')
                    .select('*', { count: 'exact', head: true })
                    .eq('station_id', s.id)
                    .gte('timestamp', start)
                    .lte('timestamp', end)
            );
            const snapshots = await Promise.all(promises);
            snapshots.forEach((snap, snIdx) => {
                results[batch[snIdx].id] = snap.count || 0;
            });
            console.log(`Progression: ${i + batch.length}/${stations.length} stations...`);
        }
        return results;
    }

    console.log("Comptage Février...");
    const febCounts = await getCounts(febStart, febEnd);
    console.log("Comptage Mars...");
    const marCounts = await getCounts(marStart, marEnd);

    // 3. Organise by region
    const auditByRegion = {};
    for (const [name, depts] of Object.entries(REGIONS)) {
        auditByRegion[name] = [];
    }

    for (const st of stations) {
        let sid = String(st.id);
        if (sid.length === 7) sid = "0" + sid;
        const dept = sid.substring(0, 2);
        const region = DEPT_TO_REGION[dept] || "Inconnu";

        if (!auditByRegion[region]) auditByRegion[region] = [];

        const fCount = febCounts[st.id] || 0;
        const mCount = marCounts[st.id] || 0;

        auditByRegion[region].push({
            id: st.id,
            name: st.name,
            febCov: Number((fCount / febExpected * 100).toFixed(1)),
            marCov: Number((mCount / marExpected * 100).toFixed(1))
        });
    }

    // 4. Generate Markdown
    let md = `# Audit National de Couverture Météo\n\n`;
    md += `*Généré le ${new Date().toLocaleString()}*\n\n`;

    for (const [region, list] of Object.entries(auditByRegion)) {
        if (list.length === 0) continue;

        md += `## Région : ${region}\n\n`;
        md += `| Station | ID | Fév 2026 | Mars 2026 |\n`;
        md += `| :--- | :--- | :--- | :--- |\n`;

        list.sort((a, b) => a.name.localeCompare(b.name));
        list.forEach(r => {
            const formatCov = (val) => {
                if (val === 0) return `❌ **0%**`;
                if (val < 50) return `⚠️ **${val}%**`;
                if (val < 95) return `⚡ ${val}%`;
                return `✅ ${val}%`;
            };
            md += `| ${r.name} | \`${r.id}\` | ${formatCov(r.febCov)} | ${formatCov(r.marCov)} |\n`;
        });
        md += `\n`;
    }

    fs.writeFileSync('./tmp/audit_national_complet.md', md, 'utf8');
    console.log("Audit National terminé. Fichier: ./tmp/audit_national_complet.md");
}

nationalAudit();
