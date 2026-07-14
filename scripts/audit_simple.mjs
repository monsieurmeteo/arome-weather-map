import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const stationNames = JSON.parse(fs.readFileSync('./src/data/stationNames.json', 'utf-8'));

async function audit() {
    const lines = [];
    const add = (s) => lines.push(s);

    const { data: latest } = await supabase.from('observations_6mn').select('timestamp').order('timestamp', { ascending: false }).limit(1);
    const latestTs = latest?.[0]?.timestamp;
    const latestAge = latestTs ? Math.round((Date.now() - new Date(latestTs).getTime()) / 60000) : '???';
    add('DERNIER_RELEVE=' + latestTs + '|AGE=' + latestAge + 'min');

    const oneHourAgo = new Date(Date.now() - 60 * 60000).toISOString();
    let allRecent = [];
    let from = 0;
    while (true) {
        const { data } = await supabase.from('observations_6mn').select('station_id').gte('timestamp', oneHourAgo).range(from, from + 999);
        if (!data || data.length === 0) break;
        allRecent.push(...data);
        if (data.length < 1000) break;
        from += 1000;
    }
    const uniqueHour = new Set(allRecent.map(r => r.station_id));
    add('STATIONS_ACTIVES_1H=' + uniqueHour.size);

    const samples = [
        ['59606004', 'Valenciennes'], ['59580003', 'Steenvoorde'], ['59343001', 'Lille'],
        ['59178001', 'Douai'], ['59183001', 'Dunkerque'], ['62160001', 'Boulogne'],
        ['02173002', 'Chauny'], ['75114001', 'Paris'], ['69029001', 'Lyon'],
        ['13055001', 'Marseille'], ['31069002', 'Toulouse'], ['33281007', 'Bordeaux'],
        ['67124005', 'Strasbourg'], ['35281001', 'Rennes'], ['44020001', 'Nantes'],
    ];

    for (const [id, name] of samples) {
        const { data: d } = await supabase.from('observations_6mn')
            .select('timestamp,t,u,ff,fxi,dd,td,rr_per,pres')
            .eq('station_id', id).order('timestamp', { ascending: false }).limit(1);
        if (d && d[0]) {
            const age = Math.round((Date.now() - new Date(d[0].timestamp).getTime()) / 60000);
            add(name + '|' + id + '|age=' + age + '|T=' + d[0].t + '|U=' + d[0].u + '|FF=' + d[0].ff + '|FXI=' + d[0].fxi + '|DD=' + d[0].dd + '|TD=' + d[0].td + '|RR=' + d[0].rr_per + '|P=' + d[0].pres);
        } else {
            add(name + '|' + id + '|ABSENT');
        }
    }

    const nordIds = Object.keys(stationNames).filter(id => id.startsWith('59') || id.startsWith('62'));
    const nordMissing = nordIds.filter(id => !uniqueHour.has(id));
    add('NORD_MISSING=' + nordMissing.length);
    if (nordMissing.length > 0) {
        nordMissing.forEach(id => add('MISS|' + id + '|' + stationNames[id]));
    }

    fs.writeFileSync('./scripts/audit_result.json', JSON.stringify(lines, null, 2));
    lines.forEach(l => console.log(l));
}
audit();
