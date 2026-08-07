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
        const { data, error } = await supabase
            .from('stations')
            .select('id, name')
            .range(from, from + 999);
        if (error || !data || data.length === 0) break;
        allStations.push(...data);
        if (data.length < 1000) break;
        from += 1000;
    }
    return allStations;
}

async function performAudit() {
    console.log("🚀 Lancement de l'audit massif...");
    const stations = await getAllStations();
    console.log(`📋 ${stations.length} stations détectées.`);

    const start = "2026-02-01T00:00:00Z";
    const end = "2026-02-28T23:59:59Z";
    const EXPECTED = 6720;

    const results = [];
    const BATCH_SIZE = 50; // Requests in parallel

    for (let i = 0; i < stations.length; i += BATCH_SIZE) {
        const batch = stations.slice(i, i + BATCH_SIZE);
        process.stdout.write(`⚡ Progression : ${i}/${stations.length} stations...\r`);

        const promises = batch.map(async (st) => {
            try {
                // Check non-null RR
                const { count, error } = await supabase
                    .from('observations_6mn')
                    .select('*', { count: 'exact', head: true })
                    .eq('station_id', st.id)
                    .gte('timestamp', start)
                    .lte('timestamp', end)
                    .not('rr_per', 'is', null);

                if (error) throw error;

                return {
                    id: st.id,
                    name: st.name,
                    count: count || 0,
                    coverage: Number(((count || 0) / EXPECTED * 100).toFixed(1))
                };
            } catch (err) {
                return { id: st.id, name: st.name, count: 0, coverage: 0, error: true };
            }
        });

        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
    }

    // Filter only those with GAPS (< 99% to be safe)
    const gaps = results.filter(r => r.coverage < 99);
    gaps.sort((a, b) => a.count - b.count);

    let md = `# 📊 Rapport d'Audit Exhaustif - Février 2026\n\n`;
    md += `**Stations analysées :** ${stations.length}\n`;
    md += `**Stations avec lacunes :** ${gaps.length}\n\n`;
    md += `| Station | ID | Points Pluie | Qualité |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;

    gaps.forEach(r => {
        let status = "✅";
        if (r.count === 0) status = "❌ **VIDE**";
        else if (r.coverage < 20) status = "🔴 CRITIQUE";
        else if (r.coverage < 80) status = "⚠️ MAJEUR";
        else status = "⚡ MINIME";

        md += `| ${r.name} | \`${r.id}\` | ${r.count} | ${status} (${r.coverage}%) |\n`;
    });

    fs.writeFileSync('./tmp/audit_complet_final.md', md, 'utf8');
    console.log(`\n✅ Audit terminé ! Le rapport est prêt : ./tmp/audit_complet_final.md`);
}

performAudit();
