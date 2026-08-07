import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const stationNames = JSON.parse(fs.readFileSync('./src/data/stationNames.json', 'utf-8'));

async function fullAudit() {
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║   AUDIT COMPLET — Données 6 minutes dans Supabase   ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');

    // 1. Dernier relevé global
    const { data: latest } = await supabase
        .from('observations_6mn')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1);
    const latestTs = latest?.[0]?.timestamp;
    const latestAge = latestTs ? Math.round((Date.now() - new Date(latestTs).getTime()) / 60000) : '???';
    console.log(`📌 Dernier relevé global : ${latestTs} (il y a ${latestAge} min)`);
    console.log('');

    // 2. Combien de stations uniques dans la dernière heure ?
    const oneHourAgo = new Date(Date.now() - 60 * 60000).toISOString();
    let allRecent = [];
    let from = 0;
    while (true) {
        const { data } = await supabase
            .from('observations_6mn')
            .select('station_id')
            .gte('timestamp', oneHourAgo)
            .range(from, from + 999);
        if (!data || data.length === 0) break;
        allRecent.push(...data);
        if (data.length < 1000) break;
        from += 1000;
    }
    const uniqueHour = new Set(allRecent.map(r => r.station_id));

    // 3. Total stations référencées
    const { count: totalStations } = await supabase
        .from('stations')
        .select('*', { count: 'exact', head: true });
    const totalNamesJson = Object.keys(stationNames).length;

    console.log(`📊 Stations actives (< 1h) : ${uniqueHour.size}`);
    console.log(`📊 Stations dans table 'stations' : ${totalStations}`);
    console.log(`📊 Stations dans stationNames.json : ${totalNamesJson}`);
    console.log('');

    // 4. Vérification de postes spécifiques (échantillon représentatif)
    const sampleStations = [
        { id: '59606004', name: 'Valenciennes' },
        { id: '59580003', name: 'Steenvoorde' },
        { id: '59343001', name: 'Lille-Lesquin' },
        { id: '59178001', name: 'Douai' },
        { id: '59183001', name: 'Dunkerque' },
        { id: '62160001', name: 'Boulogne' },
        { id: '02173002', name: 'Chauny' },
        { id: '75114001', name: 'Paris-Montsouris' },
        { id: '69029001', name: 'Lyon-Bron' },
        { id: '13055001', name: 'Marseille-Obs' },
        { id: '31069002', name: 'Toulouse-Blagnac' },
        { id: '33281007', name: 'Bordeaux-Mérignac' },
        { id: '67124005', name: 'Strasbourg-Entzheim' },
        { id: '35281001', name: 'Rennes-St-Jacques' },
        { id: '44020001', name: 'Nantes-Bouguenais' },
    ];

    console.log('┌─────────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ Station           │ Age  │ T(°C) │ U(%) │ FF   │ FXI  │ DD  │ TD   │ RR  │ P   │');
    console.log('├─────────────────────────────────────────────────────────────────────────────────┤');

    let allOk = 0;
    let missingData = 0;

    for (const s of sampleStations) {
        const { data: d } = await supabase
            .from('observations_6mn')
            .select('timestamp, t, u, ff, fxi, dd, td, rr_per, pres')
            .eq('station_id', s.id)
            .order('timestamp', { ascending: false })
            .limit(1);

        if (d && d[0]) {
            const age = Math.round((Date.now() - new Date(d[0].timestamp).getTime()) / 60000);
            const ok = age < 30;
            const fields = [
                d[0].t !== null ? d[0].t.toFixed(1).padStart(5) : '  -- ',
                d[0].u !== null ? String(d[0].u).padStart(4) : ' -- ',
                d[0].ff !== null ? String(d[0].ff).padStart(4) : ' -- ',
                d[0].fxi !== null ? String(d[0].fxi).padStart(4) : ' -- ',
                d[0].dd !== null ? String(d[0].dd).padStart(3) : ' --',
                d[0].td !== null ? d[0].td.toFixed(1).padStart(4) : ' -- ',
                d[0].rr_per !== null ? String(d[0].rr_per).padStart(3) : ' --',
                d[0].pres !== null ? d[0].pres.toFixed(0).padStart(4) : ' -- ',
            ];
            const status = ok ? '✅' : '⚠️';
            console.log(`│ ${status} ${s.name.padEnd(16)} │ ${String(age).padStart(3)}m │${fields.join(' │')} │`);
            if (ok) allOk++;
            else missingData++;
        } else {
            console.log(`│ ❌ ${s.name.padEnd(16)} │  N/A │  --  │ --  │ --  │ --  │ -- │ --  │ -- │ --  │`);
            missingData++;
        }
    }

    console.log('└─────────────────────────────────────────────────────────────────────────────────┘');
    console.log('');
    console.log(`RÉSULTAT: ${allOk}/${sampleStations.length} stations OK | ${missingData} en retard ou absentes`);

    // 5. Stations du Nord qui manquent complètement
    const nordIds = Object.keys(stationNames).filter(id => id.startsWith('59') || id.startsWith('62'));
    let nordMissing = [];
    for (const id of nordIds) {
        if (!uniqueHour.has(id)) {
            nordMissing.push(id + ' (' + stationNames[id] + ')');
        }
    }
    if (nordMissing.length > 0) {
        console.log('');
        console.log(`⚠️ Stations Nord/Pas-de-Calais SANS données récentes (< 1h) : ${nordMissing.length}`);
        nordMissing.forEach(s => console.log('   - ' + s));
    } else {
        console.log('');
        console.log('✅ Toutes les stations Nord/Pas-de-Calais ont des données récentes !');
    }
}

fullAudit();
