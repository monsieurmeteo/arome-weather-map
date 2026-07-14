#!/usr/bin/env node
/**
 * AUDIT DES LACUNES MENSUELLES — Février & Mars 2026
 *
 * Pour chaque poste météo connu :
 *   - Compte le nombre de relevés par jour dans Supabase
 *   - Détecte les jours sans données ou avec trop peu de relevés
 *   - Fournit un rapport Markdown lisible
 *
 * Usage :
 *   node scripts/audit_monthly_gaps.mjs
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

// ── Charger la liste des stations depuis stations_index.json ──
const stationsIndexPath = path.resolve(process.cwd(), 'src/data/stations_index.json');
const stationNamesPath = path.resolve(process.cwd(), 'src/data/stationNames.json');

let stations = [];
let stationNamesMap = {};

try {
    stations = JSON.parse(fs.readFileSync(stationsIndexPath, 'utf-8'));
    console.log(`📋 ${stations.length} stations chargées depuis stations_index.json`);
} catch (e) {
    console.warn('⚠️ Erreur lecture stations_index.json:', e.message);
}

try {
    stationNamesMap = JSON.parse(fs.readFileSync(stationNamesPath, 'utf-8'));
} catch (e) {
    console.warn('⚠️ Erreur lecture stationNames.json:', e.message);
}

// ── Paramètres des périodes ──
// On analyse février complet + mars jusqu'à aujourd'hui
const TODAY = new Date('2026-03-08'); // date actuelle
const MONTHS = [
    {
        label: 'Février 2026',
        start: '2026-02-01',
        end: '2026-03-01',        // exclu
        days: 28
    },
    {
        label: 'Mars 2026 (partiel)',
        start: '2026-03-01',
        end: '2026-03-09',        // jusqu'à aujourd'hui inclus (demain exclu)
        days: 8  // 1→8 mars
    }
];

// Seuil : un jour avec moins de X relevés est considéré "lacunaire"
// Théoriquement : 24h × 10 relevés/h = 240 relevés par jour (6 min)
// On accepte un minimum de 60 relevés (25% de la journée) pour valider
const MIN_RECORDS_PER_DAY = 60;
// Minimum pour dire que le jour est "bon"
const GOOD_RECORDS_PER_DAY = 200;

// Noms des départements
const DEPT_NAMES = {
    "02": "Aisne", "59": "Nord", "60": "Oise", "62": "Pas-de-Calais", "80": "Somme"
};

// ── Générer les jours d'une période ──
function getDaysInRange(startStr, endStr) {
    const days = [];
    const current = new Date(startStr);
    const end = new Date(endStr);
    while (current < end) {
        days.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }
    return days;
}

// ── Compter les relevés par jour pour une station ──
async function countRecordsByDay(stationId, startDate, endDate) {
    // On utilise une requête paginée pour compter par jour
    // On récupère juste les timestamps pour analyser la distribution
    const startISO = `${startDate}T00:00:00Z`;
    const endISO = `${endDate}T00:00:00Z`;

    let allTimestamps = [];
    let from = 0;
    const pageSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('observations_6mn')
            .select('timestamp')
            .eq('station_id', stationId)
            .gte('timestamp', startISO)
            .lt('timestamp', endISO)
            .order('timestamp', { ascending: true })
            .range(from, from + pageSize - 1);

        if (error) {
            console.error(`  ❌ Erreur pour ${stationId}: ${error.message}`);
            break;
        }
        if (!data || data.length === 0) break;
        allTimestamps.push(...data.map(r => r.timestamp));
        if (data.length < pageSize) break;
        from += pageSize;
    }

    // Compter par jour
    const countByDay = {};
    for (const ts of allTimestamps) {
        const day = ts.substring(0, 10);
        countByDay[day] = (countByDay[day] || 0) + 1;
    }

    return { countByDay, total: allTimestamps.length };
}

// ── Formater un nombre de relevés en indicateur visuel ──
function formatCount(count, expectedMax = 240) {
    if (count === undefined || count === null || count === 0) return '❌  0';
    if (count < MIN_RECORDS_PER_DAY) return `🔴 ${String(count).padStart(3)}`;
    if (count < GOOD_RECORDS_PER_DAY) return `🟡 ${String(count).padStart(3)}`;
    return `✅ ${String(count).padStart(3)}`;
}

// ── AUDIT PRINCIPAL ──
async function runMonthlyAudit() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   AUDIT LACUNES MENSUELLES — Février & Mars 2026          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`  Date d'exécution : ${new Date().toLocaleString('fr-FR')}\n`);

    // Regrouper les stations par département
    const stationsByDept = {};
    for (const s of stations) {
        const dept = s.dept || s.id.substring(0, 2);
        if (!stationsByDept[dept]) stationsByDept[dept] = [];
        stationsByDept[dept].push(s);
    }

    const report = [];
    report.push('# 📊 AUDIT DES LACUNES MÉTÉO — Février & Mars 2026\n');
    report.push(`> **Date d'audit** : ${new Date().toLocaleString('fr-FR')}  `);
    report.push(`> **Base de données** : Supabase \`observations_6mn\`  `);
    report.push(`> **Seuil acceptable** : ≥ ${MIN_RECORDS_PER_DAY} relevés/jour  `);
    report.push(`> **Idéal** : ≥ ${GOOD_RECORDS_PER_DAY} relevés/jour (= ~83% couverture)\n`);
    report.push('| Légende | Signification |');
    report.push('|---|---|');
    report.push(`| ✅ | ≥ ${GOOD_RECORDS_PER_DAY} relevés/jour (bon) |`);
    report.push(`| 🟡 | ${MIN_RECORDS_PER_DAY}–${GOOD_RECORDS_PER_DAY - 1} relevés/jour (partiel) |`);
    report.push(`| 🔴 | < ${MIN_RECORDS_PER_DAY} relevés/jour (lacunaire) |`);
    report.push(`| ❌ | 0 relevé (aucune donnée) |\n`);

    // Résumé global
    const globalSummary = {
        totalStations: stations.length,
        stationsWithGapsFebruary: 0,
        stationsWithGapsMarch: 0,
        stationsNoDataFebruary: 0,
        stationsNoDataMarch: 0
    };

    // Stocker les résultats pour le résumé
    const allResults = {};

    // Parcourir par département
    const sortedDepts = Object.keys(stationsByDept).sort();

    for (const dept of sortedDepts) {
        const deptStations = stationsByDept[dept];
        const deptName = DEPT_NAMES[dept] || `Dept ${dept}`;

        console.log(`\n📍 Département ${dept} — ${deptName} (${deptStations.length} stations)`);
        report.push(`---\n## 📍 ${dept} — ${deptName}\n`);

        for (const station of deptStations) {
            const sid = station.id;
            const sname = stationNamesMap[sid] || station.name || sid;
            console.log(`   🔍 ${sname} (${sid})...`);

            const stationResults = { id: sid, name: sname, months: {} };

            for (const period of MONTHS) {
                const days = getDaysInRange(period.start, period.end);
                const { countByDay, total } = await countRecordsByDay(sid, period.start, period.end);

                const missingDays = [];
                const lacunaryDays = [];
                const partialDays = [];
                let daysWithGoodData = 0;

                for (const day of days) {
                    const count = countByDay[day] || 0;
                    if (count === 0) missingDays.push(day);
                    else if (count < MIN_RECORDS_PER_DAY) lacunaryDays.push({ day, count });
                    else if (count < GOOD_RECORDS_PER_DAY) partialDays.push({ day, count });
                    else daysWithGoodData++;
                }

                stationResults.months[period.label] = {
                    total,
                    days: days.length,
                    missingDays,
                    lacunaryDays,
                    partialDays,
                    daysWithGoodData,
                    countByDay
                };

                if (total === 0) {
                    if (period.label.startsWith('Février')) globalSummary.stationsNoDataFebruary++;
                    else globalSummary.stationsNoDataMarch++;
                } else if (missingDays.length > 0 || lacunaryDays.length > 0) {
                    if (period.label.startsWith('Février')) globalSummary.stationsWithGapsFebruary++;
                    else globalSummary.stationsWithGapsMarch++;
                }
            }

            allResults[sid] = stationResults;

            // ── Écrire la section pour cette station ──
            report.push(`### 🏢 ${sname} \`${sid}\`\n`);

            for (const period of MONTHS) {
                const res = stationResults.months[period.label];
                const days = getDaysInRange(period.start, period.end);

                report.push(`#### ${period.label} (${res.days} jours)\n`);
                report.push(`- **Total relevés** : ${res.total}`);
                report.push(`- **Jours sans données** : ${res.missingDays.length}/${res.days}`);
                report.push(`- **Jours lacunaires** (< ${MIN_RECORDS_PER_DAY}) : ${res.lacunaryDays.length}/${res.days}`);
                report.push(`- **Jours partiels** (${MIN_RECORDS_PER_DAY}–${GOOD_RECORDS_PER_DAY - 1}) : ${res.partialDays.length}/${res.days}`);
                report.push(`- **Jours bons** (≥ ${GOOD_RECORDS_PER_DAY}) : ${res.daysWithGoodData}/${res.days}\n`);

                // Tableau jour par jour
                // On fait des lignes de 7 jours pour la lisibilité
                const headers = [];
                const values = [];

                for (const day of days) {
                    const d = new Date(day);
                    const dayNum = d.getDate();
                    headers.push(`**${String(dayNum).padStart(2)}**`);
                    const cnt = res.countByDay[day] || 0;
                    if (cnt === 0) values.push('❌');
                    else if (cnt < MIN_RECORDS_PER_DAY) values.push('🔴');
                    else if (cnt < GOOD_RECORDS_PER_DAY) values.push('🟡');
                    else values.push('✅');
                }

                // Tableau par semaines de 7 jours
                for (let i = 0; i < days.length; i += 7) {
                    const chunk = days.slice(i, i + 7);
                    const hRow = '| ' + chunk.map(day => `**${String(new Date(day).getDate()).padStart(2)}**`).join(' | ') + ' |';
                    const sep = '|' + chunk.map(() => '---').join('|') + '|';
                    const vRow = '| ' + chunk.map(day => {
                        const cnt = res.countByDay[day] || 0;
                        if (cnt === 0) return '❌';
                        if (cnt < MIN_RECORDS_PER_DAY) return `🔴(${cnt})`;
                        if (cnt < GOOD_RECORDS_PER_DAY) return `🟡(${cnt})`;
                        return `✅(${cnt})`;
                    }).join(' | ') + ' |';
                    report.push(hRow);
                    report.push(sep);
                    report.push(vRow);
                    report.push('');
                }

                if (res.missingDays.length > 0) {
                    report.push(`> ⚠️ **Jours totalement absents** : ${res.missingDays.join(', ')}\n`);
                }
                if (res.lacunaryDays.length > 0) {
                    const detail = res.lacunaryDays.map(d => `${d.day} (${d.count} relevés)`).join(', ');
                    report.push(`> 🔴 **Jours très lacunaires** : ${detail}\n`);
                }
            }
        }
    }

    // ── Résumé global ──
    report.unshift(''); // saut de ligne avant
    const summaryLines = [
        '## 📈 Résumé Global\n',
        `| Métrique | Février 2026 | Mars 2026 (1→8) |`,
        `|---|---|---|`,
        `| Stations totales analysées | ${globalSummary.totalStations} | ${globalSummary.totalStations} |`,
        `| Sans AUCUNE donnée | ${globalSummary.stationsNoDataFebruary} | ${globalSummary.stationsNoDataMarch} |`,
        `| Avec lacunes (données partielles) | ${globalSummary.stationsWithGapsFebruary} | ${globalSummary.stationsWithGapsMarch} |`,
        ''
    ];

    // Insérer le résumé après l'intro
    const introEnd = report.findIndex(l => l.startsWith('| Légende')) + 5;
    report.splice(introEnd, 0, ...summaryLines);

    // ── Tableau récapitulatif stations × lacunes ──
    report.push('---\n## 🗺️ Tableau de synthèse toutes stations\n');
    report.push('| Station | ID | Relevés Фev | Jours ❌ Fev | Relevés Mars | Jours ❌ Mars |');
    report.push('|---|---|---|---|---|---|');

    for (const s of stations) {
        const res = allResults[s.id];
        if (!res) continue;
        const feb = res.months['Février 2026'];
        const mar = res.months['Mars 2026 (partiel)'];
        const febMissing = (feb?.missingDays?.length || 0) + (feb?.lacunaryDays?.length || 0);
        const marMissing = (mar?.missingDays?.length || 0) + (mar?.lacunaryDays?.length || 0);
        const febIcon = feb?.total === 0 ? '❌' : febMissing > 7 ? '🔴' : febMissing > 0 ? '🟡' : '✅';
        const marIcon = mar?.total === 0 ? '❌' : marMissing > 3 ? '🔴' : marMissing > 0 ? '🟡' : '✅';
        report.push(`| ${res.name} | \`${s.id}\` | ${febIcon} ${feb?.total ?? 0} | ${febMissing}/28 | ${marIcon} ${mar?.total ?? 0} | ${marMissing}/8 |`);
    }

    // ── Écrire le rapport ──
    const reportText = report.join('\n');
    const outPath = path.resolve(process.cwd(), 'audit_lacunes_mensuel_report.md');
    fs.writeFileSync(outPath, reportText, 'utf-8');

    // ── Écrire aussi le JSON des résultats bruts ──
    const jsonOut = {
        auditDate: new Date().toISOString(),
        periods: MONTHS,
        globalSummary,
        stations: allResults
    };
    const jsonPath = path.resolve(process.cwd(), 'audit_lacunes_mensuel_data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonOut, null, 2), 'utf-8');

    // ── Console finale ──
    console.log('\n' + '═'.repeat(60));
    console.log('  📋 RÉSUMÉ FINAL');
    console.log('═'.repeat(60));
    console.log(`  Stations analysées       : ${globalSummary.totalStations}`);
    console.log(`  \n  FÉVRIER 2026 :`);
    console.log(`    Sans aucune donnée     : ${globalSummary.stationsNoDataFebruary}`);
    console.log(`    Avec lacunes           : ${globalSummary.stationsWithGapsFebruary}`);
    console.log(`  \n  MARS 2026 (1→8 mars) :`);
    console.log(`    Sans aucune donnée     : ${globalSummary.stationsNoDataMarch}`);
    console.log(`    Avec lacunes           : ${globalSummary.stationsWithGapsMarch}`);
    console.log('\n  📄 Rapport : audit_lacunes_mensuel_report.md');
    console.log('  📊 Données : audit_lacunes_mensuel_data.json');
    console.log('═'.repeat(60));
}

runMonthlyAudit().catch(err => {
    console.error('❌ Erreur fatale:', err.message);
    process.exit(1);
});
