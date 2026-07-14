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

async function deepAudit() {
    console.log("Démarrage de l'Audit Qualité National Sévère (Février 2026)...");
    const stations = await getAllStations();
    const start = "2026-02-01T00:00:00Z";
    const end = "2026-02-28T23:59:59Z";
    const expected = 6720;

    const results = [];
    const stationBatchSize = 10; // Slow but accurate without loading DB too much

    for (let i = 0; i < stations.length; i += stationBatchSize) {
        const batch = stations.slice(i, i + stationBatchSize);
        process.stdout.write(`Progression: ${i}/${stations.length} stations...\r`);

        const promises = batch.map(async (s) => {
            // Count rows with Temperature
            const { count: countT, error: errT } = await supabase
                .from('observations_6mn')
                .select('*', { count: 'exact', head: true })
                .eq('station_id', s.id)
                .gte('timestamp', start)
                .lte('timestamp', end)
                .not('t', 'is', null);

            // Count rows with Rain
            const { count: countRR, error: errRR } = await supabase
                .from('observations_6mn')
                .select('*', { count: 'exact', head: true })
                .eq('station_id', s.id)
                .gte('timestamp', start)
                .lte('timestamp', end)
                .not('rr_per', 'is', null);

            if (errT || errRR) return null;

            return {
                id: s.id,
                name: s.name,
                coverageT: Number(((countT || 0) / expected * 100).toFixed(1)),
                coverageRR: Number(((countRR || 0) / expected * 100).toFixed(1)),
                countT: countT || 0,
                countRR: countRR || 0
            };
        });

        const batchResults = await Promise.all(promises);
        results.push(...batchResults.filter(r => r !== null));
    }

    const anomalies = results.filter(r => r.coverageT < 95 || r.coverageRR < 95);
    anomalies.sort((a, b) => Math.min(a.coverageT, a.coverageRR) - Math.min(b.coverageT, b.coverageRR));

    let md = `# Audit Qualité Final - Février 2026\n\n`;
    md += `*Vérification stricte de la présence de valeurs valides (non NULL).*\n\n`;
    md += `**Total stations :** ${stations.length}\n`;
    md += `**Stations à compléter :** ${anomalies.length}\n\n`;
    md += `| Station | ID | T (%) | Pluie (%) | Points Pluie |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;

    anomalies.forEach(r => {
        const fmt = (v) => v === 0 ? `❌ 0%` : (v < 50 ? `⚠️ **${v}%**` : `⚡ ${v}%`);
        md += `| ${r.name} | \`${r.id}\` | ${fmt(r.coverageT)} | ${fmt(r.coverageRR)} | ${r.countRR} |\n`;
    });

    fs.writeFileSync('./tmp/liste_postes_a_rechercher.md', md, 'utf8');
    console.log(`\nAudit terminé. Rapport : ./tmp/liste_postes_a_rechercher.md`);
}

deepAudit();
