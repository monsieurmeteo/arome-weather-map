#!/usr/bin/env node
/**
 * DIAGNOSTIC STATION PAR STATION
 * 
 * Pour chaque station de stationNames.json :
 *  1. Est-elle dans l'API infrahoraire-6m (paquet bulk) ?
 *  2. Si oui, quels champs a-t-elle ?
 *  3. Si non, est-elle disponible via l'endpoint individuel DPObs ?
 *  4. Est-elle disponible en horaire ?
 * 
 * Objectif : Identifier les stations qui DEVRAIENT avoir des données 6min
 * mais qui n'en ont pas (vrais problèmes), vs celles qui ne mesurent rien
 * sur ce pas de temps (normal).
 */

import fs from 'fs';
import path from 'path';

const METEO_KEY = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const METEO_SECRET = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

async function refreshToken() {
    const auth = Buffer.from(`${METEO_KEY}:${METEO_SECRET}`).toString('base64');
    const res = await fetch('https://portail-api.meteofrance.fr/token', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials'
    });
    const data = await res.json();
    return data.access_token;
}

// Charger stationNames.json
const stationNames = JSON.parse(fs.readFileSync(
    path.resolve(process.cwd(), 'src/data/stationNames.json'), 'utf-8'
));

const FIELD_LABELS = {
    t: 'Temp', td: 'Rosée', u: 'Humid', ff: 'Vent', dd: 'Dir',
    fxi10: 'Rafale', rr_per: 'Pluie', pres: 'Pression', vv: 'Visib',
    dxi10: 'DirRaf', sss: 'Neige', insolh: 'Soleil', ray_glo01: 'Rayon',
    pmer: 'PresMer', t_10: 'T10cm', t_20: 'T20cm', t_50: 'T50cm',
    t_100: 'T100cm', etat_sol: 'Sol'
};

const DATA_FIELDS = ['t', 'td', 'u', 'ff', 'dd', 'fxi10', 'rr_per', 'pres', 'vv'];

async function main() {
    const log = [];
    const L = (s) => { log.push(s); console.log(s); };

    L('================================================================');
    L('  DIAGNOSTIC STATION PAR STATION — Couverture 6 minutes');
    L('================================================================');
    L(`  Date : ${new Date().toLocaleString('fr-FR')}`);
    L(`  Stations dans stationNames.json : ${Object.keys(stationNames).length}\n`);

    const token = await refreshToken();

    // 1) Récupérer le paquet bulk infrahoraire-6m
    const now = new Date();
    const m = now.getUTCMinutes();
    const rm = Math.floor(m / 6) * 6;
    const cycle = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), rm, 0));
    cycle.setMinutes(cycle.getMinutes() - 30);
    const dateStr = cycle.toISOString().split('.')[0] + 'Z';

    L(`📡 Fetch infrahoraire-6m bulk : ${dateStr}`);
    const bulkUrl = `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`;
    const bulkRes = await fetch(bulkUrl, { headers: { 'Authorization': `Bearer ${token}` } });
    const bulkData = await bulkRes.json();
    L(`   → ${bulkData.length} stations dans le paquet bulk\n`);

    // Index par ID
    const bulkIndex = new Map();
    bulkData.forEach(obs => {
        const id = obs.geo_id_insee;
        if (id) bulkIndex.set(id, obs);
    });

    // 2) Aussi récupérer le paquet horaire pour comparaison
    const hourDate = new Date(cycle);
    hourDate.setMinutes(0);
    const hourStr = hourDate.toISOString().split('.')[0] + 'Z';

    L(`📡 Fetch horaire bulk : ${hourStr}`);
    const hourUrl = `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/horaire?date=${hourStr}&format=json`;
    const hourRes = await fetch(hourUrl, { headers: { 'Authorization': `Bearer ${token}` } });
    let hourData = [];
    try {
        hourData = await hourRes.json();
        if (!Array.isArray(hourData)) hourData = [];
    } catch (e) {
        L(`   ⚠️ Erreur parsing horaire: ${e.message}`);
    }
    L(`   → ${hourData.length} stations dans le paquet horaire\n`);

    const hourIndex = new Map();
    hourData.forEach(obs => {
        const id = obs.geo_id_insee || obs.numero_poste;
        if (id) hourIndex.set(id, obs);
    });

    // 3) Classifier chaque station
    // On se concentre uniquement sur les départements métropolitains (01-95, 20)
    const stationIds = Object.keys(stationNames)
        .filter(id => {
            const prefix = parseInt(id.substring(0, 2));
            return prefix >= 1 && prefix <= 95;
        })
        .sort();

    L(`🔍 Analyse de ${stationIds.length} stations métropolitaines...\n`);

    const categories = {
        complete: [],       // Dans le bulk 6min avec tous les champs
        partial_synoptic: [],  // Dans le bulk 6min avec vent+humidité mais pas pression/visibilité
        partial_sapc: [],   // Dans le bulk 6min avec seulement T+RR
        missing_but_hourly: [],  // Absente du 6min MAIS présente en horaire
        missing_both: [],   // Absente des deux = probablement hors réseau
        no_temp: [],        // Présente mais même sans température
    };

    // Tester les stations absentes via DPObs individuel (échantillon)
    const missingStations = [];

    for (const id of stationIds) {
        const name = stationNames[id];
        const inBulk = bulkIndex.has(id);
        const inHour = hourIndex.has(id);

        if (inBulk) {
            const obs = bulkIndex.get(id);
            const hasTemp = obs.t != null;
            const hasWind = obs.ff != null;
            const hasHumid = obs.u != null;
            const hasPres = obs.pres != null;
            const hasVis = obs.vv != null;
            const hasRain = obs.rr_per != null;
            const hasGust = obs.fxi10 != null;

            const nonNullFields = DATA_FIELDS.filter(f => obs[f] != null);
            const nullFields = DATA_FIELDS.filter(f => obs[f] == null);

            if (!hasTemp) {
                categories.no_temp.push({ id, name, nonNullFields, nullFields });
            } else if (nonNullFields.length === DATA_FIELDS.length) {
                categories.complete.push({ id, name });
            } else if (hasWind && hasHumid) {
                categories.partial_synoptic.push({ id, name, nonNullFields, nullFields });
            } else {
                categories.partial_sapc.push({ id, name, nonNullFields, nullFields });
            }
        } else {
            missingStations.push({ id, name, inHour });
            if (inHour) {
                categories.missing_but_hourly.push({ id, name });
            } else {
                categories.missing_both.push({ id, name });
            }
        }
    }

    // 4) Tester un échantillon de stations manquantes via l'endpoint individuel DPObs
    L('═══ TEST INDIVIDUEL DES STATIONS ABSENTES DU BULK ═══\n');

    // On teste les 50 premières stations manquantes
    const toTest = missingStations.slice(0, 50);
    const dpobsResults = [];
    const delay = ms => new Promise(r => setTimeout(r, ms));

    for (const s of toTest) {
        try {
            // Test infrahoraire-6m individuel
            const url6 = `https://public-api.meteofrance.fr/public/DPObs/v1/station/infrahoraire-6m?id_station=${s.id}&date=${dateStr}&format=json`;
            const r6 = await fetch(url6, { headers: { 'Authorization': `Bearer ${token}` } });

            let result6 = 'NO_DATA';
            if (r6.ok) {
                const txt = await r6.text();
                if (!txt.startsWith('<') && txt.length > 5) {
                    const data = JSON.parse(txt);
                    if (Array.isArray(data) && data.length > 0) {
                        const obs = data[0];
                        const nonNull = DATA_FIELDS.filter(f => obs[f] != null);
                        result6 = `OK (${nonNull.length}/${DATA_FIELDS.length}: ${nonNull.join(',')})`;
                        dpobsResults.push({ ...s, dpobs6: 'OK', fields: nonNull });
                    }
                }
            } else if (r6.status === 404) {
                result6 = 'NOT_FOUND';
                dpobsResults.push({ ...s, dpobs6: 'NOT_FOUND' });
            } else {
                result6 = `HTTP_${r6.status}`;
                dpobsResults.push({ ...s, dpobs6: `HTTP_${r6.status}` });
            }

            L(`  ${s.id} ${s.name.padEnd(35)} 6min=${result6.padEnd(25)} horaire=${s.inHour ? 'OUI' : 'NON'}`);

            await delay(100); // Rate limiting
        } catch (e) {
            L(`  ${s.id} ${s.name.padEnd(35)} ERREUR: ${e.message}`);
            dpobsResults.push({ ...s, dpobs6: 'ERROR' });
        }
    }

    // 5) Générer le rapport
    const report = [];
    report.push('# 📊 Diagnostic Station par Station — Couverture infrahoraire 6 min\n');
    report.push(`> **Date** : ${new Date().toLocaleString('fr-FR')}`);
    report.push(`> **Cycle analysé** : ${dateStr}`);
    report.push(`> **Total stations métropolitaines dans stationNames.json** : ${stationIds.length}\n`);

    report.push('## 📈 Résumé par catégorie\n');
    report.push('| Catégorie | Nb stations | Description |');
    report.push('|---|---|---|');
    report.push(`| ✅ **Complètes** | ${categories.complete.length} | Tous les 9 champs présents |`);
    report.push(`| 🟡 **Synoptiques partielles** | ${categories.partial_synoptic.length} | Vent + humidité OK, manque pression/visibilité |`);
    report.push(`| 🟠 **SAPC** (T + pluie seuls) | ${categories.partial_sapc.length} | Seulement température et précipitations |`);
    report.push(`| ❌ **Sans température** | ${categories.no_temp.length} | Présentes mais sans temp (sémaphores/caps) |`);
    report.push(`| 🔴 **Absentes du 6min** (mais en horaire) | ${categories.missing_but_hourly.length} | NON transmises au pas 6min, mais horaire OK |`);
    report.push(`| ⚫ **Absentes des deux** | ${categories.missing_both.length} | Ni 6min, ni horaire — hors réseau |`);
    report.push('');
    report.push(`> **Total dans le paquet API 6min** : ${bulkData.length} stations (toutes confondues)`);
    report.push(`> **Total dans le paquet API horaire** : ${hourData.length} stations\n`);

    // 6) Détail des stations COMPLÈTES
    report.push('---\n## ✅ Stations complètes (9/9 champs)\n');
    report.push(`${categories.complete.length} stations disposent de TOUTES les données au pas 6 minutes.\n`);
    if (categories.complete.length > 0 && categories.complete.length <= 200) {
        report.push('| ID | Nom |');
        report.push('|---|---|');
        categories.complete.forEach(s => {
            report.push(`| \`${s.id}\` | ${s.name} |`);
        });
        report.push('');
    }

    // 7) Détail des stations SYNOPTIQUES partielles
    report.push('---\n## 🟡 Stations synoptiques partielles\n');
    report.push(`${categories.partial_synoptic.length} stations ont le vent et l'humidité mais pas tous les champs.\n`);
    if (categories.partial_synoptic.length > 0) {
        report.push('| ID | Nom | Champs OK | Champs manquants |');
        report.push('|---|---|---|---|');
        categories.partial_synoptic.forEach(s => {
            report.push(`| \`${s.id}\` | ${s.name} | ${s.nonNullFields.join(', ')} | ${s.nullFields.join(', ')} |`);
        });
        report.push('');
    }

    // 8) Détail des stations SAPC (T+RR seulement)
    report.push('---\n## 🟠 Stations SAPC — Température + Pluie uniquement\n');
    report.push(`${categories.partial_sapc.length} stations ne remontent que la température et les précipitations.\n`);
    report.push('> Ces stations sont des capteurs automatiques simplifiés. L\'absence de vent/humidité est **structurelle**.\n');
    if (categories.partial_sapc.length > 0 && categories.partial_sapc.length <= 500) {
        report.push('| ID | Nom | Champs OK |');
        report.push('|---|---|---|');
        categories.partial_sapc.forEach(s => {
            report.push(`| \`${s.id}\` | ${s.name} | ${s.nonNullFields.join(', ')} |`);
        });
        report.push('');
    }

    // 9) Stations ABSENTES du 6min mais en horaire
    report.push('---\n## 🔴 Stations absentes du pas 6 min mais présentes en horaire\n');
    report.push(`> **${categories.missing_but_hourly.length}** stations sont dans l'API horaire mais PAS dans l'infrahoraire 6 min.\n`);
    report.push('> Ce sont potentiellement des stations qui transmettent uniquement à l\'heure ronde.\n');
    if (categories.missing_but_hourly.length > 0) {
        report.push('| ID | Nom |');
        report.push('|---|---|');
        categories.missing_but_hourly.forEach(s => {
            report.push(`| \`${s.id}\` | ${s.name} |`);
        });
        report.push('');
    }

    // 10) Stations ABSENTES des deux
    report.push('---\n## ⚫ Stations absentes de TOUTES les API temps réel\n');
    report.push(`> **${categories.missing_both.length}** stations de votre fichier ne sont dans AUCUNE API temps réel.\n`);
    report.push('> Ce sont probablement des stations NIVOSE, INRAE, fermées, ou hors réseau automatique.\n');
    if (categories.missing_both.length > 0) {
        // Grouper par département
        const byDept = {};
        categories.missing_both.forEach(s => {
            const dept = s.id.substring(0, 2);
            if (!byDept[dept]) byDept[dept] = [];
            byDept[dept].push(s);
        });

        report.push('| Dept | Nb | Stations |');
        report.push('|---|---|---|');
        Object.keys(byDept).sort().forEach(dept => {
            const list = byDept[dept];
            const names = list.map(s => `${s.name} (\`${s.id}\`)`).join(', ');
            report.push(`| ${dept} | ${list.length} | ${names} |`);
        });
        report.push('');
    }

    // 11) Test individuel DPObs
    report.push('---\n## 🧪 Test individuel DPObs (stations absentes du bulk)\n');
    const found = dpobsResults.filter(r => r.dpobs6 === 'OK');
    const notFound = dpobsResults.filter(r => r.dpobs6 === 'NOT_FOUND');
    const errors = dpobsResults.filter(r => r.dpobs6 !== 'OK' && r.dpobs6 !== 'NOT_FOUND');

    report.push(`Sur ${toTest.length} stations testées individuellement :\n`);
    report.push(`- **${found.length}** trouvées via DPObs individuel (mais absentes du paquet bulk !)`);
    report.push(`- **${notFound.length}** confirmées absentes (404)`);
    report.push(`- **${errors.length}** erreurs\n`);

    if (found.length > 0) {
        report.push('### Stations trouvées via DPObs mais absentes du bulk\n');
        report.push('> ⚠️ **Bug possible** : ces stations ont des données 6min via l\'endpoint individuel mais ne sont pas dans le paquet bulk !\n');
        report.push('| ID | Nom | Champs disponibles |');
        report.push('|---|---|---|');
        found.forEach(s => {
            report.push(`| \`${s.id}\` | ${s.name} | ${s.fields.join(', ')} |`);
        });
        report.push('');
    }

    // 12) Point spécifique Steenvoorde
    report.push('---\n## 🔎 Focus : Steenvoorde (59580003)\n');
    const steenId = '59580003';
    const steenBulk = bulkIndex.get(steenId);
    const steenHour = hourIndex.get(steenId);
    const steenDpobs = dpobsResults.find(r => r.id === steenId);

    report.push(`- **Dans le paquet bulk 6min** : ${steenBulk ? 'OUI' : 'NON ❌'}`);
    report.push(`- **Dans le paquet horaire** : ${steenHour ? 'OUI' : 'NON ❌'}`);
    if (steenDpobs) {
        report.push(`- **Via DPObs individuel 6min** : ${steenDpobs.dpobs6}`);
    }
    report.push(`- **Présente dans stationNames.json** : OUI (${stationNames[steenId]})\n`);

    if (!steenBulk && !steenHour) {
        report.push('> ⚠️ Steenvoorde n\'est dans AUCUNE API temps réel. Elle est probablement **hors réseau automatique** ou **fermée**.\n');
        report.push('> Il faudrait la retirer de stationNames.json ou la marquer comme inactive.\n');
    }

    // Sauvegarder
    const reportText = report.join('\n');
    const reportPath = path.resolve(process.cwd(), 'diagnostic_stations_detail.md');
    fs.writeFileSync(reportPath, reportText, 'utf-8');

    // JSON complet pour analyse
    const jsonOut = {
        date: dateStr,
        totalStationsLocal: stationIds.length,
        totalBulk6min: bulkData.length,
        totalHoraire: hourData.length,
        categories: {
            complete: categories.complete.length,
            partial_synoptic: categories.partial_synoptic.length,
            partial_sapc: categories.partial_sapc.length,
            no_temp: categories.no_temp.length,
            missing_but_hourly: categories.missing_but_hourly.length,
            missing_both: categories.missing_both.length
        },
        missingStations: missingStations.map(s => ({
            id: s.id,
            name: s.name,
            inHourly: s.inHour,
            dpobs: dpobsResults.find(r => r.id === s.id)?.dpobs6 || 'NOT_TESTED'
        })),
        stationsDetail: {
            complete: categories.complete,
            partial_synoptic: categories.partial_synoptic.map(s => ({ id: s.id, name: s.name, fields: s.nonNullFields })),
            partial_sapc: categories.partial_sapc.map(s => ({ id: s.id, name: s.name, fields: s.nonNullFields })),
            no_temp: categories.no_temp.map(s => ({ id: s.id, name: s.name, fields: s.nonNullFields }))
        }
    };
    fs.writeFileSync(path.resolve(process.cwd(), 'diagnostic_stations_detail.json'), JSON.stringify(jsonOut, null, 2));

    L(`\n📄 Rapport : ${reportPath}`);
    L('📊 JSON : diagnostic_stations_detail.json');

    // Résumé console
    L('\n' + '═'.repeat(60));
    L('  RÉSUMÉ');
    L('═'.repeat(60));
    L(`  Stations locales (métro)     : ${stationIds.length}`);
    L(`  ✅ Complètes (9/9)           : ${categories.complete.length}`);
    L(`  🟡 Synoptiques partielles    : ${categories.partial_synoptic.length}`);
    L(`  🟠 SAPC (T+RR)              : ${categories.partial_sapc.length}`);
    L(`  ❌ Sans température          : ${categories.no_temp.length}`);
    L(`  🔴 Absentes 6min, OK horaire : ${categories.missing_but_hourly.length}`);
    L(`  ⚫ Absentes partout          : ${categories.missing_both.length}`);
    L('═'.repeat(60));
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
