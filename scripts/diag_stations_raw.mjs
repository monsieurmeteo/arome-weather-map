#!/usr/bin/env node
/**
 * DIAGNOSTIC BRUT : Comparer ce que l'API renvoie RÉELLEMENT
 * pour différents types de stations (synoptique, SAPC, etc.)
 * 
 * Objectif: identifier si les données manquantes viennent de l'API
 * ou du traitement dans le collecteur.
 */

import fs from 'fs';

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

// Stations de test : mélange synoptique / SAPC / problématiques
const TEST_STATIONS = {
    // Synoptiques connues (devraient être complètes)
    'RENNES-ST JACQUES': '35281001',
    'PARIS-ORLY': '91027001',  // Orly
    'TOULOUSE-BLAGNAC': '31069001',

    // SAPC (celles qu'on a identifié comme "incomplètes")
    'BOURBON_SAPC': '03036002',
    'AILLEVILLE_SAPC': '10002001',
    'AUBUSSON_SAPC': '23008004',

    // Stations intermédiaires (avec vent mais pas pression)
    'ALPUECH': '12005001',
    'AMBERT': '63003004',

    // Stations qu'on sait être dans l'API mais marquées incomplètes
    'ARBENT': '01014002',
    'DOUAI': '59178001',
};

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🔬 DIAGNOSTIC BRUT — Données API vs Collecteur');
    console.log('═══════════════════════════════════════════════════════════\n');

    const token = await refreshToken();

    // 1) Récupérer le paquet complet infrahoraire-6m
    const now = new Date();
    const minutes = now.getUTCMinutes();
    const roundedMin = Math.floor(minutes / 6) * 6;
    const cycle = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), roundedMin, 0));
    cycle.setMinutes(cycle.getMinutes() - 30);
    const dateStr = cycle.toISOString().split('.')[0] + 'Z';

    console.log(`📡 Fetch infrahoraire-6m : ${dateStr}\n`);
    const url = `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'apikey': token } });
    const allData = await res.json();

    if (!Array.isArray(allData)) {
        console.error('❌ Réponse inattendue:', typeof allData, JSON.stringify(allData).substring(0, 500));
        return;
    }

    console.log(`✅ ${allData.length} stations reçues\n`);

    // 2) Examiner les champs présents dans le PREMIER objet pour comprendre la structure
    console.log('═══ STRUCTURE DE DONNÉES (1er objet) ═══\n');
    const first = allData[0];
    const allKeys = Object.keys(first);
    console.log(`Clés présentes (${allKeys.length}) : ${allKeys.join(', ')}\n`);
    console.log('Valeurs du 1er objet:');
    for (const [k, v] of Object.entries(first)) {
        console.log(`  ${k}: ${JSON.stringify(v)} (${typeof v})`);
    }

    // 3) Analyser TOUTES les clés présentes dans l'ensemble du dataset
    console.log('\n═══ ANALYSE DES CLÉS SUR TOUT LE DATASET ═══\n');
    const keyStats = {};
    allData.forEach(obs => {
        Object.keys(obs).forEach(k => {
            if (!keyStats[k]) keyStats[k] = { present: 0, nonNull: 0, examples: [] };
            keyStats[k].present++;
            if (obs[k] !== null && obs[k] !== undefined) {
                keyStats[k].nonNull++;
                if (keyStats[k].examples.length < 3) keyStats[k].examples.push(obs[k]);
            }
        });
    });

    console.log('| Clé | Présente | Non-null | % non-null | Exemples |');
    console.log('|---|---|---|---|---|');
    Object.keys(keyStats).sort().forEach(k => {
        const s = keyStats[k];
        const pct = Math.round(s.nonNull / allData.length * 100);
        const examples = s.examples.map(e => JSON.stringify(e)).join(', ');
        console.log(`| ${k} | ${s.present} | ${s.nonNull} | ${pct}% | ${examples} |`);
    });

    // 4) Examiner nos stations de test
    console.log('\n═══ STATIONS DE TEST — DUMP COMPLET ═══\n');

    for (const [name, id] of Object.entries(TEST_STATIONS)) {
        const obs = allData.find(s =>
            s.geo_id_insee === id ||
            s.id_station === id ||
            s.id === id ||
            s.numero_poste === id
        );

        console.log(`\n── ${name} (${id}) ──`);
        if (!obs) {
            console.log('  ❌ NON TROUVÉE dans les données !');
            // Essayer de chercher avec le préfixe 5 chars
            const id5 = id.substring(0, 5);
            const partial = allData.find(s => {
                const sid = s.geo_id_insee || s.id_station || s.id || '';
                return sid.startsWith(id5);
            });
            if (partial) {
                const pid = partial.geo_id_insee || partial.id_station || partial.id;
                console.log(`  ⚠️ Trouvée avec préfixe ${id5}: ID=${pid}`);
            }
            continue;
        }

        // Dump tous les champs
        for (const [k, v] of Object.entries(obs)) {
            const status = (v === null || v === undefined) ? '❌ NULL' : '✅';
            console.log(`  ${status} ${k} = ${JSON.stringify(v)}`);
        }

        // Résumé
        const nullFields = Object.entries(obs).filter(([, v]) => v === null || v === undefined).map(([k]) => k);
        const nonNullFields = Object.entries(obs).filter(([, v]) => v !== null && v !== undefined).map(([k]) => k);
        console.log(`  📊 ${nonNullFields.length} champs avec données, ${nullFields.length} champs null`);
        if (nullFields.length > 0) {
            console.log(`  ❌ Champs null: ${nullFields.join(', ')}`);
        }
    }

    // 5) Vérifier si la MÊME station a des champs différents selon les endpoints
    console.log('\n═══ COMPARAISON MULTI-ENDPOINTS ═══\n');

    // Tester Rennes sur les 3 endpoints
    const testId = '35281001';
    const endpoints = [
        {
            name: 'infrahoraire-6m (paquet)',
            url: `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`,
            isBulk: true
        },
        {
            name: 'observation station (DPObs)',
            url: `https://public-api.meteofrance.fr/public/DPObs/v1/station/infrahoraire-6m?id_station=${testId}&date=${dateStr}&format=json`,
            isBulk: false
        },
    ];

    for (const ep of endpoints) {
        console.log(`\n── ${ep.name} ──`);
        try {
            const r = await fetch(ep.url, { headers: { 'Authorization': `Bearer ${token}`, 'apikey': token, 'accept': 'application/json' } });
            if (!r.ok) {
                console.log(`  ❌ HTTP ${r.status}: ${(await r.text()).substring(0, 200)}`);
                continue;
            }
            const text = await r.text();
            if (text.startsWith('<')) {
                console.log(`  ❌ Réponse HTML/XML`);
                continue;
            }
            const data = JSON.parse(text);

            if (ep.isBulk) {
                // Chercher Rennes dans le paquet
                const rennes = Array.isArray(data) ? data.find(s =>
                    (s.geo_id_insee || s.id_station || s.id) === testId
                ) : null;
                if (rennes) {
                    const keys = Object.keys(rennes);
                    console.log(`  ✅ Trouvée. ${keys.length} champs: ${keys.join(', ')}`);
                    const nullK = Object.entries(rennes).filter(([, v]) => v === null).map(([k]) => k);
                    console.log(`  ❌ Champs null: ${nullK.length > 0 ? nullK.join(', ') : 'AUCUN'}`);
                } else {
                    console.log(`  ❌ Rennes non trouvée dans le paquet`);
                }
            } else {
                // Réponse directe
                if (Array.isArray(data) && data.length > 0) {
                    const obs = data[0];
                    const keys = Object.keys(obs);
                    console.log(`  ✅ ${data.length} obs. ${keys.length} champs: ${keys.join(', ')}`);
                    const nullK = Object.entries(obs).filter(([, v]) => v === null).map(([k]) => k);
                    console.log(`  ❌ Champs null: ${nullK.length > 0 ? nullK.join(', ') : 'AUCUN'}`);
                } else {
                    console.log(`  ⚠️ Réponse: ${JSON.stringify(data).substring(0, 300)}`);
                }
            }
        } catch (e) {
            console.log(`  ❌ Erreur: ${e.message}`);
        }
    }

    // 6) Test spécifique: est-ce que les SAPC ont PLUS de données via l'endpoint individuel ?
    console.log('\n═══ TEST SAPC VIA ENDPOINT INDIVIDUEL ═══\n');
    const sapcStations = ['03036002', '10002001', '23008004'];

    for (const sid of sapcStations) {
        console.log(`\n── Station ${sid} ──`);

        // Via le paquet (bulk)
        const fromBulk = allData.find(s => (s.geo_id_insee || s.id_station || s.id) === sid);
        if (fromBulk) {
            const nullK = Object.entries(fromBulk).filter(([, v]) => v === null || v === undefined).map(([k]) => k);
            const nonNullK = Object.entries(fromBulk).filter(([, v]) => v !== null && v !== undefined).map(([k]) => k);
            console.log(`  [PAQUET] ${nonNullK.length} champs non-null, ${nullK.length} null`);
            console.log(`    Non-null: ${nonNullK.join(', ')}`);
            console.log(`    Null: ${nullK.join(', ')}`);
        }

        // Via l'endpoint individuel
        try {
            const indivUrl = `https://public-api.meteofrance.fr/public/DPObs/v1/station/infrahoraire-6m?id_station=${sid}&date=${dateStr}&format=json`;
            const r = await fetch(indivUrl, { headers: { 'Authorization': `Bearer ${token}`, 'apikey': token } });
            if (r.ok) {
                const text = await r.text();
                if (!text.startsWith('<')) {
                    const data = JSON.parse(text);
                    if (Array.isArray(data) && data.length > 0) {
                        const obs = data[0];
                        const nullK = Object.entries(obs).filter(([, v]) => v === null || v === undefined).map(([k]) => k);
                        const nonNullK = Object.entries(obs).filter(([, v]) => v !== null && v !== undefined).map(([k]) => k);
                        console.log(`  [INDIVIDUEL] ${nonNullK.length} champs non-null, ${nullK.length} null`);
                        console.log(`    Non-null: ${nonNullK.join(', ')}`);
                        console.log(`    Null: ${nullK.join(', ')}`);
                    } else {
                        console.log(`  [INDIVIDUEL] Pas de données`);
                    }
                } else {
                    console.log(`  [INDIVIDUEL] Réponse HTML/XML`);
                }
            } else {
                console.log(`  [INDIVIDUEL] HTTP ${r.status}`);
            }
        } catch (e) {
            console.log(`  [INDIVIDUEL] Erreur: ${e.message}`);
        }
    }

    // 7) Sauvegarder le dump complet pour analyse
    const diagOutput = {
        date: dateStr,
        totalStations: allData.length,
        allKeys: allKeys,
        keyStats: Object.fromEntries(
            Object.entries(keyStats).map(([k, v]) => [k, { present: v.present, nonNull: v.nonNull }])
        ),
        sampleStations: {}
    };

    for (const [name, id] of Object.entries(TEST_STATIONS)) {
        const obs = allData.find(s => (s.geo_id_insee || s.id_station || s.id) === id);
        diagOutput.sampleStations[name] = obs || 'NOT_FOUND';
    }

    fs.writeFileSync('diag_raw_output.json', JSON.stringify(diagOutput, null, 2));
    console.log('\n📄 Dump complet sauvegardé dans diag_raw_output.json');
}

main().catch(e => { console.error('❌ Fatal:', e); process.exit(1); });
