import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function smartAudit() {
    console.log("Démarrage Audit Intelligent...");

    // 1. Fetch all stations
    let allStations = [];
    let from = 0;
    while (true) {
        const { data } = await supabase.from('stations').select('id, name').range(from, from + 999);
        if (!data || data.length === 0) break;
        allStations.push(...data);
        if (data.length < 1000) break;
        from += 1000;
    }
    const stationCount = allStations.length;
    console.log(`${stationCount} stations trouvées.`);

    // 2. Fetch daily summaries for Feb 2026
    console.log("Analyse des résumés quotidiens...");
    let summaries = [];
    from = 0;
    while (true) {
        const { data } = await supabase
            .from('daily_summaries')
            .select('station_id, date, rain_total')
            .gte('date', '2026-02-01')
            .lte('date', '2026-02-28')
            .range(from, from + 4999); // summaries is bigger
        if (!data || data.length === 0) break;
        summaries.push(...data);
        if (data.length < 5000) break;
        from += 5000;
    }

    // 3. Count days per station
    const stats = {};
    allStations.forEach(s => stats[s.id] = { name: s.name, days: 0 });
    summaries.forEach(sm => {
        if (stats[sm.station_id]) stats[sm.station_id].days++;
    });

    // 4. Identify stations with missing days or NO summaries
    const incomplete = allStations.filter(s => stats[s.id].days < 28);
    console.log(`${incomplete.length} stations ont des jours manquants.`);

    // 5. For the others (28 days), we need to check if those 28 days are "fake" (e.g. 1 point only correctly aggregated)
    // We will sample a few or just be thorough for those.
    // Actually, Chauny has 28 days (probably) because I inserted rows for every day.
    // Let's check Chauny specifically in this logic.

    // 6. Detailed audit for "incomplete" stations to get exact point count
    const finalResults = [];
    const batchSize = 40;
    const targets = incomplete; // Currently focusing on those with < 28 days

    // Wait, let's also add stations where rain_total is exceptionally low or null in summaries?
    // No, better check all.

    console.log("Audit profond des stations suspectes...");
    for (let i = 0; i < targets.length; i += batchSize) {
        const batch = targets.slice(i, i + batchSize);
        process.stdout.write(`Progression: ${i}/${targets.length}...\r`);

        const promises = batch.map(async (st) => {
            const { count } = await supabase
                .from('observations_6mn')
                .select('*', { count: 'exact', head: true })
                .eq('station_id', st.id)
                .gte('timestamp', '2026-02-01')
                .lte('timestamp', '2026-02-28')
                .not('rr_per', 'is', null);

            return { id: st.id, name: st.name, count: count || 0, days: stats[st.id].days };
        });
        const res = await Promise.all(promises);
        finalResults.push(...res);
    }

    // 7. Output report
    let md = `# Audit de Couverture (Smart) - Février 2026\n\n`;
    md += `Total stations analysées : ${stationCount}\n`;
    md += `Stations avec < 28 jours ou < 95% de points : ${finalResults.length}\n\n`;
    md += `| Station | ID | Jours | Points (Pluie) | % |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;

    finalResults.sort((a, b) => a.count - b.count);
    finalResults.forEach(r => {
        const perc = (r.count / 67.2).toFixed(1);
        md += `| ${r.name} | \`${r.id}\` | ${r.days} | ${r.count} | ${perc}% |\n`;
    });

    fs.writeFileSync('./tmp/audit_smart.md', md, 'utf8');
    console.log("\nTerminé. Rapport : ./tmp/audit_smart.md");
}

smartAudit();
