import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function globalAudit() {
    console.log("Démarrage de l'audit complet du réseau (Hauts-de-France)...");

    const { data: stations, error: err1 } = await supabase
        .from('stations')
        .select('id, name')
        .or('id.like.59%,id.like.62%,id.like.80%,id.like.60%,id.like.02%');

    if (err1) { console.error(err1); return; }

    const months = [
        { name: "Février 2026", start: "2026-02-01T00:00:00Z", end: "2026-02-28T23:59:59Z", days: 28 },
        { name: "Mars 2026 (Partiel)", start: "2026-03-01T00:00:00Z", end: new Date().toISOString(), days: new Date().getDate() }
    ];

    const auditResults = [];

    for (const st of stations) {
        const stats = { id: st.id, name: st.name, monthly: {} };

        for (const m of months) {
            const expectedPoints = m.days * 24 * 10;
            const { count, error } = await supabase
                .from('observations_6mn')
                .select('*', { count: 'exact', head: true })
                .eq('station_id', st.id)
                .gte('timestamp', m.start)
                .lte('timestamp', m.end);

            if (error) continue;

            const coverage = (count || 0) / expectedPoints;
            stats.monthly[m.name] = {
                count: count || 0,
                expected: expectedPoints,
                coverage: Number((coverage * 100).toFixed(1))
            };
        }
        auditResults.push(stats);
    }

    // Génération du rapport Markdown
    let md = `# Audit Complet de Couverture Météo - Hauts-de-France\n\n`;
    md += `*Généré le ${new Date().toLocaleString()}*\n\n`;
    md += `L'audit analyse la présence des relevés aux 6 minutes dans la table \`observations_6mn\`.\n\n`;

    md += `## État de santé du réseau (Couverture moyenne)\n\n`;
    md += `| Station | ID | Fév 2026 | Mars 2026 |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;

    // Tri par nom pour le tableau
    auditResults.sort((a, b) => a.name.localeCompare(b.name));

    auditResults.forEach(r => {
        const fev = r.monthly["Février 2026"].coverage;
        const mar = r.monthly["Mars 2026 (Partiel)"].coverage;

        const formatCov = (val) => {
            if (val === 0) return `❌ **0%**`;
            if (val < 50) return `⚠️ **${val}%**`;
            if (val < 95) return `⚡ ${val}%`;
            return `✅ ${val}%`;
        };

        md += `| ${r.name} | \`${r.id}\` | ${formatCov(fev)} | ${formatCov(mar)} |\n`;
    });

    md += `\n---\n**Note** : Une couverture de 100% correspond à un relevé toutes les 6 minutes sans interruption.`;

    fs.writeFileSync('./tmp/audit_complet_stations.md', md, 'utf8');
    fs.writeFileSync('./tmp/audit_data.json', JSON.stringify(auditResults, null, 2), 'utf8');

    console.log("Audit terminé. Rapport généré dans ./tmp/audit_complet_stations.md");
}

globalAudit();
