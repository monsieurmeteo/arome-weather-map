import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function getAllStations() {
    let allStations = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;
    while (hasMore) {
        const { data, error } = await supabase.from('stations').select('id, name').range(from, from + batchSize - 1);
        if (error) break;
        allStations.push(...data);
        if (data.length < batchSize) hasMore = false;
        else from += batchSize;
    }
    return allStations;
}

// Concurrency controller
async function fastAudit() {
    console.log("Démarrage de l'Audit National (Concurrence élevée)...");
    const stations = await getAllStations();
    console.log(`Analyse de ${stations.length} stations...`);

    const start = "2026-02-01T00:00:00Z";
    const end = "2026-02-28T23:59:59Z";
    const expected = 6720;

    const results = [];
    const concurrency = 30; // 30 simultaneous requests

    for (let i = 0; i < stations.length; i += concurrency) {
        const batch = stations.slice(i, i + concurrency);
        process.stdout.write(`Progression: ${i}/${stations.length} stations...\r`);

        const promises = batch.map(async (s) => {
            try {
                // One query to count everything
                // We fetch the count of non-null rr_per and t
                // Supabase doesn't support multiple counts in one query via select easily
                // BUT we can use filter().not('t', 'is', null) which returns the count if head: true

                const { count: cT } = await supabase
                    .from('observations_6mn')
                    .select('*', { count: 'exact', head: true })
                    .eq('station_id', s.id)
                    .gte('timestamp', start)
                    .lte('timestamp', end)
                    .not('t', 'is', null);

                const { count: cRR } = await supabase
                    .from('observations_6mn')
                    .select('*', { count: 'exact', head: true })
                    .eq('station_id', s.id)
                    .gte('timestamp', start)
                    .lte('timestamp', end)
                    .not('rr_per', 'is', null);

                return {
                    id: s.id,
                    name: s.name,
                    covT: Number(((cT || 0) / expected * 100).toFixed(1)),
                    covRR: Number(((cRR || 0) / expected * 100).toFixed(1)),
                    countRR: cRR || 0
                };
            } catch (e) {
                return null;
            }
        });

        const batchResults = await Promise.all(promises);
        results.push(...batchResults.filter(r => r !== null));
    }

    console.log("\nTri et génération du rapport...");
    const filtered = results.filter(r => r.covT < 95 || r.covRR < 95);
    filtered.sort((a, b) => Math.min(a.covT, a.covRR) - Math.min(b.covT, b.covRR));

    let md = `# Audit Qualité Complet - Février 2026\n\n`;
    md += `*Vérification de l'intégralité des ${stations.length} postes.*\n\n`;
    md += `| Station | ID | T (%) | RR (%) | Lignes |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;

    filtered.forEach(r => {
        const fmt = (v) => v < 50 ? `⚠️ **${v}%**` : (v < 95 ? `⚡ ${v}%` : `✅ ${v}%`);
        md += `| ${r.name} | \`${r.id}\` | ${fmt(r.covT)} | ${fmt(r.covRR)} | ${r.countRR} |\n`;
    });

    fs.writeFileSync('./tmp/audit_final_chauny_ok.md', md, 'utf8');
    console.log("Rapport généré: ./tmp/audit_final_chauny_ok.md");
}

fastAudit();
