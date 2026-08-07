#!/usr/bin/env node
/**
 * AUDIT COMPLET DES STATIONS MÉTÉO-FRANCE — API infrahoraire-6m
 * 
 * Objectif : Identifier département par département les anomalies :
 *   - Stations avec données manquantes (champs null)
 *   - Stations sans température, vent, pluie, etc.
 *   - Départements avec couverture incomplète
 * 
 * Utilise le même endpoint que le collecteur : DPPaquetObs/v1/paquet/stations/infrahoraire-6m
 */

import fs from 'fs';
import path from 'path';

// ── Credentials Météo-France ──
const METEO_KEY = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const METEO_SECRET = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

// ── Charger la liste des stations connues ──
const stationsListPath = path.resolve(process.cwd(), 'src/data/stations_list.json');
const stationsNamesPath = path.resolve(process.cwd(), 'src/data/stationNames.json');

let knownStations = {};
let stationNames = {};

try {
    const stList = JSON.parse(fs.readFileSync(stationsListPath, 'utf-8'));
    stList.features.forEach(f => {
        knownStations[f.properties.num] = {
            nom: f.properties.nom,
            coords: f.geometry.coordinates
        };
    });
    console.log(`📋 ${Object.keys(knownStations).length} stations connues chargées depuis stations_list.json`);
} catch (e) {
    console.warn('⚠️ Impossible de charger stations_list.json:', e.message);
}

try {
    stationNames = JSON.parse(fs.readFileSync(stationsNamesPath, 'utf-8'));
    console.log(`📋 ${Object.keys(stationNames).length} noms de stations chargés depuis stationNames.json`);
} catch (e) {
    console.warn('⚠️ Impossible de charger stationNames.json:', e.message);
}

// ── Noms des départements ──
const DEPT_NAMES = {
    "01": "Ain", "02": "Aisne", "03": "Allier", "04": "Alpes-de-Haute-Provence",
    "05": "Hautes-Alpes", "06": "Alpes-Maritimes", "07": "Ardèche", "08": "Ardennes",
    "09": "Ariège", "10": "Aube", "11": "Aude", "12": "Aveyron",
    "13": "Bouches-du-Rhône", "14": "Calvados", "15": "Cantal", "16": "Charente",
    "17": "Charente-Maritime", "18": "Cher", "19": "Corrèze", "20": "Corse",
    "21": "Côte-d'Or", "22": "Côtes-d'Armor", "23": "Creuse", "24": "Dordogne",
    "25": "Doubs", "26": "Drôme", "27": "Eure", "28": "Eure-et-Loir",
    "29": "Finistère", "30": "Gard", "31": "Haute-Garonne", "32": "Gers",
    "33": "Gironde", "34": "Hérault", "35": "Ille-et-Vilaine", "36": "Indre",
    "37": "Indre-et-Loire", "38": "Isère", "39": "Jura", "40": "Landes",
    "41": "Loir-et-Cher", "42": "Loire", "43": "Haute-Loire", "44": "Loire-Atlantique",
    "45": "Loiret", "46": "Lot", "47": "Lot-et-Garonne", "48": "Lozère",
    "49": "Maine-et-Loire", "50": "Manche", "51": "Marne", "52": "Haute-Marne",
    "53": "Mayenne", "54": "Meurthe-et-Moselle", "55": "Meuse", "56": "Morbihan",
    "57": "Moselle", "58": "Nièvre", "59": "Nord", "60": "Oise",
    "61": "Orne", "62": "Pas-de-Calais", "63": "Puy-de-Dôme", "64": "Pyrénées-Atlantiques",
    "65": "Hautes-Pyrénées", "66": "Pyrénées-Orientales", "67": "Bas-Rhin", "68": "Haut-Rhin",
    "69": "Rhône", "70": "Haute-Saône", "71": "Saône-et-Loire", "72": "Sarthe",
    "73": "Savoie", "74": "Haute-Savoie", "75": "Paris", "76": "Seine-Maritime",
    "77": "Seine-et-Marne", "78": "Yvelines", "79": "Deux-Sèvres", "80": "Somme",
    "81": "Tarn", "82": "Tarn-et-Garonne", "83": "Var", "84": "Vaucluse",
    "85": "Vendée", "86": "Vienne", "87": "Haute-Vienne", "88": "Vosges",
    "89": "Yonne", "90": "Territoire de Belfort", "91": "Essonne", "92": "Hauts-de-Seine",
    "93": "Seine-Saint-Denis", "94": "Val-de-Marne", "95": "Val-d'Oise",
    "971": "Guadeloupe", "972": "Martinique", "973": "Guyane", "974": "La Réunion", "976": "Mayotte"
};

// ── Champs attendus au pas 6 minutes ──
const EXPECTED_FIELDS = ['t', 'td', 'u', 'ff', 'dd', 'pres', 'rr_per', 'fxi10', 'vv'];
const FIELD_LABELS = {
    t: 'Température',
    td: 'Point de rosée',
    u: 'Humidité',
    ff: 'Vent moyen',
    dd: 'Direction vent',
    pres: 'Pression',
    rr_per: 'Précipitations',
    fxi10: 'Rafales',
    vv: 'Visibilité'
};

// ── Authentification ──
async function refreshToken() {
    const auth = Buffer.from(`${METEO_KEY}:${METEO_SECRET}`).toString('base64');
    const res = await fetch('https://portail-api.meteofrance.fr/token', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials'
    });
    if (!res.ok) throw new Error(`Token error: ${res.status}`);
    const data = await res.json();
    return data.access_token;
}

// ── Récupérer les données infrahoraires 6m ──
async function fetchInfrahoraire6m(token, dateStr) {
    const url = `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'apikey': token } });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API ${res.status}: ${txt.substring(0, 200)}`);
    }
    return await res.json();
}

// ── Départements depuis l'ID station (2 premiers chiffres = code département) ──
function getDeptCode(stationId) {
    if (!stationId) return 'XX';
    const prefix = stationId.substring(0, 2);
    // Départements > 95 (DOM-TOM) : 3 premiers chiffres
    if (parseInt(prefix) > 95) return stationId.substring(0, 3);
    // Corse : 20 → on retourne "20"
    return prefix;
}

function getStationName(stationId) {
    return stationNames[stationId] || knownStations[stationId]?.nom || '(inconnu)';
}

// ── AUDIT PRINCIPAL ──
async function runAudit() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🔍 AUDIT COMPLET DES STATIONS MÉTÉO-FRANCE (6 min)');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  Date d'exécution : ${new Date().toLocaleString('fr-FR')}\n`);

    // 1) Obtenir le token
    console.log('🔑 Authentification OAuth...');
    const token = await refreshToken();
    console.log('✅ Token obtenu\n');

    // 2) Récupérer deux cycles de 6 minutes pour comparer
    const now = new Date();
    const minutes = now.getUTCMinutes();
    const roundedMin = Math.floor(minutes / 6) * 6;

    // Cycle -30 min (pour être sûr que les données sont dispo)
    const cycle1 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), roundedMin, 0));
    cycle1.setMinutes(cycle1.getMinutes() - 30);
    const date1 = cycle1.toISOString().split('.')[0] + 'Z';

    // Cycle -36 min (6 min avant)
    const cycle2 = new Date(cycle1.getTime() - 6 * 60 * 1000);
    const date2 = cycle2.toISOString().split('.')[0] + 'Z';

    console.log(`📡 Récupération cycle 1 : ${date1}...`);
    const data1 = await fetchInfrahoraire6m(token, date1);
    console.log(`   → ${Array.isArray(data1) ? data1.length : 0} stations reçues\n`);

    console.log(`📡 Récupération cycle 2 : ${date2}...`);
    const data2 = await fetchInfrahoraire6m(token, date2);
    console.log(`   → ${Array.isArray(data2) ? data2.length : 0} stations reçues\n`);

    if (!Array.isArray(data1) || data1.length === 0) {
        console.error('❌ Aucune donnée reçue. Arrêt de l\'audit.');
        return;
    }

    // 3) Analyser les données
    const allStations = data1;
    const stationsById2 = new Map();
    if (Array.isArray(data2)) {
        data2.forEach(s => {
            const id = s.geo_id_insee || s.id_station || s.id;
            if (id) stationsById2.set(id, s);
        });
    }

    // Grouper par département
    const deptData = {};
    const globalStats = {
        totalStations: allStations.length,
        stationsAvecTemp: 0,
        stationsAvecVent: 0,
        stationsAvecPluie: 0,
        stationsAvecPression: 0,
        stationsAvecRafales: 0,
        stationsAvecVisibilite: 0,
        stationsAvecHumidite: 0,
        stationsAvecRosee: 0,
        stationsAvecDirection: 0,
        stationsCompletes: 0,
        fieldsNull: {}
    };

    EXPECTED_FIELDS.forEach(f => globalStats.fieldsNull[f] = 0);

    allStations.forEach(obs => {
        const id = obs.geo_id_insee || obs.id_station || obs.id;
        if (!id) return;
        const dept = getDeptCode(id);
        if (!deptData[dept]) {
            deptData[dept] = {
                stations: [],
                anomalies: [],
                fieldsMissing: {},
                nbStationsCompletes: 0
            };
            EXPECTED_FIELDS.forEach(f => deptData[dept].fieldsMissing[f] = 0);
        }

        // Analyse des champs manquants
        const missingFields = [];
        EXPECTED_FIELDS.forEach(field => {
            const val = obs[field];
            if (val === null || val === undefined) {
                missingFields.push(field);
                deptData[dept].fieldsMissing[field]++;
                globalStats.fieldsNull[field]++;
            }
        });

        // Compter les types de données présentes
        if (obs.t !== null && obs.t !== undefined) globalStats.stationsAvecTemp++;
        if (obs.ff !== null && obs.ff !== undefined) globalStats.stationsAvecVent++;
        if (obs.rr_per !== null && obs.rr_per !== undefined) globalStats.stationsAvecPluie++;
        if (obs.pres !== null && obs.pres !== undefined) globalStats.stationsAvecPression++;
        if (obs.fxi10 !== null && obs.fxi10 !== undefined) globalStats.stationsAvecRafales++;
        if (obs.vv !== null && obs.vv !== undefined) globalStats.stationsAvecVisibilite++;
        if (obs.u !== null && obs.u !== undefined) globalStats.stationsAvecHumidite++;
        if (obs.td !== null && obs.td !== undefined) globalStats.stationsAvecRosee++;
        if (obs.dd !== null && obs.dd !== undefined) globalStats.stationsAvecDirection++;

        const isComplete = missingFields.length === 0;
        if (isComplete) {
            globalStats.stationsCompletes++;
            deptData[dept].nbStationsCompletes++;
        }

        // Vérifier si la station était aussi dans le cycle 2
        const inCycle2 = stationsById2.has(id);

        // Identifier les anomalies graves
        const anomalyDetails = [];
        if (obs.t === null || obs.t === undefined) anomalyDetails.push('❄️ Pas de température');
        if (obs.ff === null || obs.ff === undefined) anomalyDetails.push('🌬️ Pas de vent');
        if (obs.fxi10 === null || obs.fxi10 === undefined) anomalyDetails.push('💨 Pas de rafales');
        if (obs.rr_per === null || obs.rr_per === undefined) anomalyDetails.push('🌧️ Pas de pluie');
        if (obs.vv === null || obs.vv === undefined) anomalyDetails.push('🌫️ Pas de visibilité');
        if (obs.pres === null || obs.pres === undefined) anomalyDetails.push('📊 Pas de pression');
        if (obs.u === null || obs.u === undefined) anomalyDetails.push('💧 Pas d\'humidité');

        // Température en Kelvin → Celsius pour l'affichage
        let tempC = null;
        if (obs.t !== null && obs.t !== undefined) {
            tempC = obs.t > 150 ? Math.round((obs.t - 273.15) * 10) / 10 : Math.round(obs.t * 10) / 10;
        }

        deptData[dept].stations.push({
            id,
            nom: getStationName(id),
            temp: tempC,
            ff: obs.ff !== null && obs.ff !== undefined ? Math.round(obs.ff * 3.6) : null,
            fxi10: obs.fxi10 !== null && obs.fxi10 !== undefined ? Math.round(obs.fxi10 * 3.6) : null,
            rr_per: obs.rr_per,
            u: obs.u,
            pres: obs.pres,
            vv: obs.vv,
            dd: obs.dd,
            td: obs.td,
            missingFields,
            isComplete,
            inBothCycles: inCycle2,
            anomalies: anomalyDetails
        });

        if (anomalyDetails.length > 0) {
            deptData[dept].anomalies.push({
                id,
                nom: getStationName(id),
                details: anomalyDetails,
                missingCount: missingFields.length
            });
        }
    });

    // 4) Générer le rapport
    const report = [];
    report.push('# 🔍 AUDIT DES STATIONS MÉTÉO-FRANCE — Données infrahoraires 6 min\n');
    report.push(`> **Date d'audit** : ${new Date().toLocaleString('fr-FR')}`);
    report.push(`> **Cycle analysé (principal)** : ${date1}`);
    report.push(`> **Cycle de comparaison** : ${date2}\n`);

    // Résumé global
    report.push('## 📊 Résumé Global\n');
    report.push(`| Métrique | Valeur |`);
    report.push(`|---|---|`);
    report.push(`| **Total stations reçues** | ${globalStats.totalStations} |`);
    report.push(`| **Stations complètes** (tous champs) | ${globalStats.stationsCompletes} (${Math.round(globalStats.stationsCompletes / globalStats.totalStations * 100)}%) |`);
    report.push(`| Avec Température | ${globalStats.stationsAvecTemp} (${Math.round(globalStats.stationsAvecTemp / globalStats.totalStations * 100)}%) |`);
    report.push(`| Avec Vent moyen | ${globalStats.stationsAvecVent} (${Math.round(globalStats.stationsAvecVent / globalStats.totalStations * 100)}%) |`);
    report.push(`| Avec Rafales | ${globalStats.stationsAvecRafales} (${Math.round(globalStats.stationsAvecRafales / globalStats.totalStations * 100)}%) |`);
    report.push(`| Avec Précipitations | ${globalStats.stationsAvecPluie} (${Math.round(globalStats.stationsAvecPluie / globalStats.totalStations * 100)}%) |`);
    report.push(`| Avec Pression | ${globalStats.stationsAvecPression} (${Math.round(globalStats.stationsAvecPression / globalStats.totalStations * 100)}%) |`);
    report.push(`| Avec Humidité | ${globalStats.stationsAvecHumidite} (${Math.round(globalStats.stationsAvecHumidite / globalStats.totalStations * 100)}%) |`);
    report.push(`| Avec Visibilité | ${globalStats.stationsAvecVisibilite} (${Math.round(globalStats.stationsAvecVisibilite / globalStats.totalStations * 100)}%) |`);
    report.push(`| Avec Direction vent | ${globalStats.stationsAvecDirection} (${Math.round(globalStats.stationsAvecDirection / globalStats.totalStations * 100)}%) |`);
    report.push(`| Avec Point de rosée | ${globalStats.stationsAvecRosee} (${Math.round(globalStats.stationsAvecRosee / globalStats.totalStations * 100)}%) |`);
    report.push('');

    // Tableau des champs nuls
    report.push('### Champs nuls (tous départements confondus)\n');
    report.push(`| Champ | Stations sans cette donnée | % manquant |`);
    report.push(`|---|---|---|`);
    EXPECTED_FIELDS.forEach(f => {
        const nb = globalStats.fieldsNull[f];
        const pct = Math.round(nb / globalStats.totalStations * 100);
        const label = FIELD_LABELS[f] || f;
        report.push(`| **${label}** (\`${f}\`) | ${nb} | ${pct}% |`);
    });
    report.push('');

    // 5) Détail département par département
    report.push('---\n## 🗺️ Analyse Département par Département\n');

    const sortedDepts = Object.keys(deptData).sort((a, b) => {
        // Trier par nombre d'anomalies décroissant
        return deptData[b].anomalies.length - deptData[a].anomalies.length;
    });

    // Tableau synthétique
    report.push('### Synthèse par département\n');
    report.push(`| Dept | Nom | Stations | Complètes | Anomalies | % complètes |`);
    report.push(`|---|---|---|---|---|---|`);

    // Re-trier par code département
    const sortedByCode = Object.keys(deptData).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    sortedByCode.forEach(dept => {
        const d = deptData[dept];
        const total = d.stations.length;
        const completes = d.nbStationsCompletes;
        const anomalies = d.anomalies.length;
        const pct = Math.round(completes / total * 100);
        const deptName = DEPT_NAMES[dept] || dept;
        const indicator = pct === 100 ? '✅' : pct >= 70 ? '🟡' : pct >= 50 ? '🟠' : '🔴';
        report.push(`| ${dept} | ${deptName} | ${total} | ${completes} | ${anomalies} | ${indicator} ${pct}% |`);
    });
    report.push('');

    // 6) Détail des anomalies pour chaque département
    report.push('---\n## 🚨 Détail des anomalies par département\n');

    // On ne détaille que les départements avec anomalies, triés par gravité
    sortedDepts.forEach(dept => {
        const d = deptData[dept];
        if (d.anomalies.length === 0) return;

        const deptName = DEPT_NAMES[dept] || dept;
        const total = d.stations.length;
        const completes = d.nbStationsCompletes;

        report.push(`### ${dept} — ${deptName} (${total} stations, ${completes} complètes)\n`);

        // Champs les plus souvent manquants dans ce département
        const missingFieldsSorted = EXPECTED_FIELDS
            .filter(f => d.fieldsMissing[f] > 0)
            .sort((a, b) => d.fieldsMissing[b] - d.fieldsMissing[a]);

        if (missingFieldsSorted.length > 0) {
            report.push('**Champs les plus souvent absents :**');
            missingFieldsSorted.forEach(f => {
                const nb = d.fieldsMissing[f];
                const pct = Math.round(nb / total * 100);
                report.push(`- \`${f}\` (${FIELD_LABELS[f]}) : ${nb}/${total} stations → **${pct}%** manquant`);
            });
            report.push('');
        }

        // Liste des stations avec le plus de champs manquants
        const anomaliesSorted = d.anomalies.sort((a, b) => b.missingCount - a.missingCount);
        report.push('| Station | Nom | Champs manquants | Détails |');
        report.push('|---|---|---|---|');
        anomaliesSorted.forEach(a => {
            const details = a.details.join(', ');
            report.push(`| \`${a.id}\` | ${a.nom} | ${a.missingCount}/${EXPECTED_FIELDS.length} | ${details} |`);
        });
        report.push('');
    });

    // 7) Stations présentes dans le fichier local mais absentes de l'API
    report.push('---\n## 🔎 Stations connues absentes de l\'API infrahoraire-6m\n');

    const apiStationIds = new Set(allStations.map(s => s.geo_id_insee || s.id_station || s.id));
    const stationsNamesIds = Object.keys(stationNames);
    const missingFromApi = stationsNamesIds.filter(id => !apiStationIds.has(id));

    if (missingFromApi.length > 0) {
        report.push(`> **${missingFromApi.length}** stations référencées dans \`stationNames.json\` ne sont PAS présentes dans les données infrahoraires 6m de l'API.\n`);

        // Grouper par département
        const missingByDept = {};
        missingFromApi.forEach(id => {
            const dept = getDeptCode(id);
            if (!missingByDept[dept]) missingByDept[dept] = [];
            missingByDept[dept].push({ id, nom: stationNames[id] || '(inconnu)' });
        });

        report.push('| Dept | Nom dept | Nb absentes | Stations |');
        report.push('|---|---|---|---|');
        Object.keys(missingByDept).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).forEach(dept => {
            const list = missingByDept[dept];
            const names = list.map(s => `${s.nom} (\`${s.id}\`)`).join(', ');
            const deptName = DEPT_NAMES[dept] || dept;
            report.push(`| ${dept} | ${deptName} | ${list.length} | ${names} |`);
        });
    } else {
        report.push('> ✅ Toutes les stations de `stationNames.json` sont présentes dans l\'API.\n');
    }

    // 8) Stations de l'API NON référencées localement 
    report.push('\n---\n## 🆕 Stations présentes dans l\'API mais absentes de stationNames.json\n');

    const stationNamesSet = new Set(Object.keys(stationNames));
    const extraStations = allStations.filter(s => {
        const id = s.geo_id_insee || s.id_station || s.id;
        return id && !stationNamesSet.has(id);
    });

    if (extraStations.length > 0) {
        report.push(`> **${extraStations.length}** stations reçues de l'API ne sont PAS référencées dans \`stationNames.json\`.\n`);

        // Grouper par département
        const extraByDept = {};
        extraStations.forEach(s => {
            const id = s.geo_id_insee || s.id_station || s.id;
            const dept = getDeptCode(id);
            if (!extraByDept[dept]) extraByDept[dept] = [];
            extraByDept[dept].push({
                id,
                nom: s.nom || knownStations[id]?.nom || '(sans nom)',
                hasTemp: s.t !== null && s.t !== undefined,
                hasWind: s.ff !== null && s.ff !== undefined
            });
        });

        report.push('| Dept | Nom dept | Nb non-référencées | Stations |');
        report.push('|---|---|---|---|');
        Object.keys(extraByDept).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).forEach(dept => {
            const list = extraByDept[dept];
            const names = list.map(s => `${s.nom} (\`${s.id}\` ${s.hasTemp ? '✅T' : '❌T'} ${s.hasWind ? '✅V' : '❌V'})`).join(', ');
            const deptName = DEPT_NAMES[dept] || dept;
            report.push(`| ${dept} | ${deptName} | ${list.length} | ${names} |`);
        });
    } else {
        report.push('> ✅ Toutes les stations de l\'API sont référencées localement.\n');
    }

    // 9) Vérifier la stabilité entre les 2 cycles
    report.push('\n---\n## 🔄 Stabilité entre deux cycles consécutifs\n');

    const ids1 = new Set(allStations.map(s => s.geo_id_insee || s.id_station || s.id).filter(Boolean));
    const ids2 = new Set(Array.isArray(data2) ? data2.map(s => s.geo_id_insee || s.id_station || s.id).filter(Boolean) : []);

    const onlyInCycle1 = [...ids1].filter(id => !ids2.has(id));
    const onlyInCycle2 = [...ids2].filter(id => !ids1.has(id));

    report.push(`| | Cycle 1 (${date1}) | Cycle 2 (${date2}) |`);
    report.push(`|---|---|---|`);
    report.push(`| Total stations | ${ids1.size} | ${ids2.size} |`);
    report.push(`| Communes | ${[...ids1].filter(id => ids2.has(id)).length} | - |`);
    report.push(`| Uniquement cycle 1 | ${onlyInCycle1.length} | - |`);
    report.push(`| Uniquement cycle 2 | - | ${onlyInCycle2.length} |`);
    report.push('');

    if (onlyInCycle1.length > 0) {
        report.push(`**Stations absentes du cycle 2 (instabilité) :**`);
        onlyInCycle1.slice(0, 30).forEach(id => {
            report.push(`- \`${id}\` ${getStationName(id)}`);
        });
        if (onlyInCycle1.length > 30) report.push(`- ... et ${onlyInCycle1.length - 30} autres`);
        report.push('');
    }

    if (onlyInCycle2.length > 0) {
        report.push(`**Stations absentes du cycle 1 (instabilité) :**`);
        onlyInCycle2.slice(0, 30).forEach(id => {
            report.push(`- \`${id}\` ${getStationName(id)}`);
        });
        if (onlyInCycle2.length > 30) report.push(`- ... et ${onlyInCycle2.length - 30} autres`);
        report.push('');
    }

    // 10) Échantillon de données brutes (première station de chaque département pour debug)
    report.push('---\n## 🧪 Échantillon de données brutes (1 station/dept)\n');
    report.push('| Dept | Station | T(K) | T(°C) | U(%) | FF(m/s) | FXi10(m/s) | DD(°) | RR(mm) | Pres(hPa) | VV(m) |');
    report.push('|---|---|---|---|---|---|---|---|---|---|---|');

    sortedByCode.forEach(dept => {
        const first = deptData[dept].stations[0];
        if (!first) return;
        const obs = allStations.find(s => (s.geo_id_insee || s.id_station || s.id) === first.id);
        if (!obs) return;
        report.push(`| ${dept} | ${first.nom} | ${obs.t ?? '❌'} | ${first.temp ?? '❌'} | ${obs.u ?? '❌'} | ${obs.ff ?? '❌'} | ${obs.fxi10 ?? '❌'} | ${obs.dd ?? '❌'} | ${obs.rr_per ?? '❌'} | ${obs.pres ?? '❌'} | ${obs.vv ?? '❌'} |`);
    });

    // Écrire le rapport
    const reportText = report.join('\n');
    const outputPath = path.resolve(process.cwd(), 'audit_stations_mf_report.md');
    fs.writeFileSync(outputPath, reportText, 'utf-8');

    // Écrire aussi les données brutes JSON pour analyse complémentaire
    const jsonOutput = {
        auditDate: new Date().toISOString(),
        cycle1: date1,
        cycle2: date2,
        globalStats,
        departements: {},
        stabilite: {
            cycle1Only: onlyInCycle1,
            cycle2Only: onlyInCycle2
        }
    };

    sortedByCode.forEach(dept => {
        const d = deptData[dept];
        jsonOutput.departements[dept] = {
            nom: DEPT_NAMES[dept] || dept,
            totalStations: d.stations.length,
            completes: d.nbStationsCompletes,
            anomalies: d.anomalies.length,
            fieldsMissing: d.fieldsMissing,
            stationsAvecAnomalie: d.anomalies.map(a => ({
                id: a.id,
                nom: a.nom,
                missingCount: a.missingCount,
                details: a.details
            }))
        };
    });

    const jsonPath = path.resolve(process.cwd(), 'audit_stations_mf_data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2), 'utf-8');

    // Afficher le résumé dans la console
    console.log('\n' + '═'.repeat(60));
    console.log('  📋 RÉSUMÉ DE L\'AUDIT');
    console.log('═'.repeat(60));
    console.log(`  Total stations API infrahoraire : ${globalStats.totalStations}`);
    console.log(`  Stations complètes (9 champs)  : ${globalStats.stationsCompletes} (${Math.round(globalStats.stationsCompletes / globalStats.totalStations * 100)}%)`);
    console.log('');
    console.log('  Couverture par type de donnée :');
    console.log(`    Température    : ${globalStats.stationsAvecTemp}/${globalStats.totalStations} (${Math.round(globalStats.stationsAvecTemp / globalStats.totalStations * 100)}%)`);
    console.log(`    Vent moyen     : ${globalStats.stationsAvecVent}/${globalStats.totalStations} (${Math.round(globalStats.stationsAvecVent / globalStats.totalStations * 100)}%)`);
    console.log(`    Rafales        : ${globalStats.stationsAvecRafales}/${globalStats.totalStations} (${Math.round(globalStats.stationsAvecRafales / globalStats.totalStations * 100)}%)`);
    console.log(`    Précipitations : ${globalStats.stationsAvecPluie}/${globalStats.totalStations} (${Math.round(globalStats.stationsAvecPluie / globalStats.totalStations * 100)}%)`);
    console.log(`    Pression       : ${globalStats.stationsAvecPression}/${globalStats.totalStations} (${Math.round(globalStats.stationsAvecPression / globalStats.totalStations * 100)}%)`);
    console.log(`    Visibilité     : ${globalStats.stationsAvecVisibilite}/${globalStats.totalStations} (${Math.round(globalStats.stationsAvecVisibilite / globalStats.totalStations * 100)}%)`);
    console.log(`    Humidité       : ${globalStats.stationsAvecHumidite}/${globalStats.totalStations} (${Math.round(globalStats.stationsAvecHumidite / globalStats.totalStations * 100)}%)`);
    console.log('');
    console.log(`  Stabilité inter-cycles :`);
    console.log(`    Stations uniquement dans cycle 1 : ${onlyInCycle1.length}`);
    console.log(`    Stations uniquement dans cycle 2 : ${onlyInCycle2.length}`);
    console.log('');

    // Top 10 départements les plus problématiques
    console.log('  🔴 Top 10 des départements les plus problématiques :');
    sortedDepts.slice(0, 10).forEach((dept, i) => {
        const d = deptData[dept];
        if (d.anomalies.length === 0) return;
        const deptName = DEPT_NAMES[dept] || dept;
        console.log(`    ${i + 1}. ${dept} ${deptName} : ${d.anomalies.length}/${d.stations.length} stations avec anomalies`);
    });

    console.log('\n═'.repeat(60));
    console.log(`  📄 Rapport complet : ${outputPath}`);
    console.log(`  📊 Données JSON    : ${jsonPath}`);
    console.log('═'.repeat(60));
}

runAudit().catch(err => {
    console.error('❌ Erreur fatale:', err);
    process.exit(1);
});
