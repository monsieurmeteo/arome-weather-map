import fs from 'fs';

// Read the audit report
const content = fs.readFileSync('./tmp/audit_national_complet.md', 'utf8');

const regions = content.split('## Région :');
const stationsToSearch = [];

regions.slice(1).forEach(regionBlock => {
    const lines = regionBlock.split('\n');
    const regionName = lines[0].trim();

    lines.forEach(line => {
        // Match lines like: | STATION NAME | `ID` | ⚡ 86.8% | ⚡ 92.5% |
        const match = line.match(/\| (.*?) \| `(\d+)` \| (.*?) \| (.*?) \|/);
        if (match) {
            const name = match[1].trim();
            const id = match[2].trim();
            const febResult = match[3].trim();

            // We consider it "to search" if feb is NOT ✅ (less than 95%) or if it's explicitly 0 or ⚠️
            if (febResult.includes('❌') || febResult.includes('⚠️') || febResult.includes('⚡')) {
                // Parse percentage
                const percMatch = febResult.match(/(\d+\.?\d*)%/);
                const perc = percMatch ? parseFloat(percMatch[1]) : 0;

                stationsToSearch.push({
                    region: regionName,
                    name,
                    id,
                    coverage: perc,
                    status: febResult
                });
            }
        }
    });
});

// Sort by coverage ascending (worst first)
stationsToSearch.sort((a, b) => a.coverage - b.coverage);

let output = `# Liste des Stations à Rechercher (Gaps Février 2026)\n\n`;
output += `Total de stations avec des manques : **${stationsToSearch.length}**\n\n`;

output += `### 🔴 Priorité Maximale (0% à 20% de données)\n`;
output += `| Région | Nom | ID | Couverture |\n| :--- | :--- | :--- | :--- |\n`;
stationsToSearch.filter(s => s.coverage < 20).forEach(s => {
    output += `| ${s.region} | ${s.name} | \`${s.id}\` | ${s.status} |\n`;
});

output += `\n### ⚠️ Lacunes Majeures (20% à 80% de données)\n`;
output += `| Région | Nom | ID | Couverture |\n| :--- | :--- | :--- | :--- |\n`;
stationsToSearch.filter(s => s.coverage >= 20 && s.coverage < 80).forEach(s => {
    output += `| ${s.region} | ${s.name} | \`${s.id}\` | ${s.status} |\n`;
});

output += `\n### ⚡ Lacunes Légères (> 80% mais < 95%)\n`;
output += `| Région | Nom | ID | Couverture |\n| :--- | :--- | :--- | :--- |\n`;
stationsToSearch.filter(s => s.coverage >= 80 && s.coverage < 95).forEach(s => {
    output += `| ${s.region} | ${s.name} | \`${s.id}\` | ${s.status} |\n`;
});

fs.writeFileSync('./tmp/liste_recherche_prioritaire.md', output, 'utf8');
console.log("Liste générée.");
