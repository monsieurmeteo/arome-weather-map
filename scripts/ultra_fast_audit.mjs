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
    while (true) {
        const { data, error } = await supabase.from('stations').select('id, name').range(from, from + 999);
        if (error || !data || data.length === 0) break;
        allStations.push(...data);
        if (data.length < 1000) break;
        from += 1000;
    }
    return allStations;
}

async function fastAudit() {
    const stations = await getAllStations();
    console.log(`Analyse massive de ${stations.length} stations...`);

    const start = "2026-02-01T00:00:00Z";
    const end = "2026-02-28T23:59:59Z";

    const results = [];
    const concurrency = 100; // Let's go fast

    for (let i = 0; i < stations.length; i += concurrency) {
        const batch = stations.slice(i, i + concurrency);
        console.log(`Traitement: ${i} -> ${Math.min(i + concurrency, stations.length)}...`);

        const promises = batch.map(async (s) => {
            // Count rows only
            const { count, error } = await supabase
                .from('observations_6mn')
                .select('*', { count: 'exact', head: true })
                .eq('station_id', s.id)
                .gte('timestamp', start)
                .lte('timestamp', end)
                .not('rr_per', 'is', null); // Focus on RAIN which is the user concern

            return { id: s.id, name: s.name, countRR: count || 0 };
        });

        const batchRes = await Promise.all(promises);
        results.push(...batchRes);
    }

    const anomalies = results.filter(r => r.countRR < 6500); // Less than ~96%
    anomalies.sort((a, b) => a.countRR - b.countRR);

    let md = `# Audit Qualité National (Vitesse Max) - Février 2026\n\n`;
    md += `| Station | ID | Points Pluie | % |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    anomalies.forEach(r => {
        const perc = (r.countRR / 67.2).toFixed(1);
        md += `| ${r.name} | \`${r.id}\` | ${r.countRR} | ${perc}% |\n`;
    });

    fs.writeFileSync('./tmp/audit_complet_final.md', md, 'utf8');
    console.log("Terminé.");
}

fastAudit();
