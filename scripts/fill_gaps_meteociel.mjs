import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function fetchMeteocielHTML(stationId, date) {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear();
    const url = `https://www.meteociel.fr/temps-reel/obs_villes.php?code2=${stationId}&jour2=${day}&mois2=${month}&annee2=${year}&affint=1`;
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const buffer = await response.arrayBuffer();
        return new TextDecoder('windows-1252').decode(buffer);
    } catch (e) { return null; }
}

function parseMeteociel(html) {
    const observations = [];
    const rowRegex = /<tr[^>]*>\s*<td[^>]*>(\d+h\d*)<\/td>([\s\S]*?)<\/tr>/gi;
    let match;
    while ((match = rowRegex.exec(html)) !== null) {
        const timeStr = match[1];
        const cellsHtml = match[2];
        const cells = cellsHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
        if (cells.length < 4) continue;
        const parts = timeStr.split('h');
        const hour = parseInt(parts[0]);
        const minute = parseInt(parts[1]) || 0;
        const getVal = (idx) => {
            if (!cells[idx]) return null;
            const txt = cells[idx].replace(/<[^>]*>/g, '').trim();
            if (!txt || txt === '&nbsp;' || txt === '\u00A0' || txt === '-') return null;
            const val = parseFloat(txt.replace(/[^\d.-]/g, '').replace(',', '.'));
            return isNaN(val) ? null : val;
        };
        observations.push({ hour, minute, t: getVal(1), u: getVal(2), td: getVal(3), ff: getVal(6), fxi: getVal(7), pres: getVal(8), rr: cells[cells.length - 1].toLowerCase().includes('aucune') ? 0 : getVal(cells.length - 1) });
    }
    return observations;
}

async function fillGapsForDay(stationId, dateStr) {
    const date = new Date(dateStr);
    const start = new Date(date); start.setUTCHours(0, 0, 0, 0);
    const end = new Date(date); end.setUTCHours(23, 54, 0, 0);

    console.log(`\n--- ${dateStr} for ${stationId} ---`);

    const { data: existing, error: e1 } = await supabase.from('observations_6mn').select('timestamp').eq('station_id', stationId).gte('timestamp', start.toISOString()).lte('timestamp', end.toISOString());
    if (e1) return console.error("Supabase Error:", e1);

    const exSet = new Set(existing.map(e => new Date(e.timestamp).toISOString()));
    const missing = [];
    let cur = new Date(start);
    while (cur <= end) { if (!exSet.has(cur.toISOString())) missing.push(cur.toISOString()); cur.setMinutes(cur.getMinutes() + 6); }

    if (missing.length === 0) return console.log("✅ No gaps.");
    console.log(`⚠️ ${missing.length} missing points.`);

    const html = await fetchMeteocielHTML(stationId, dateStr);
    if (!html) return console.error("Fetch failed.");
    const obs = parseMeteociel(html);
    const withData = obs.filter(o => o.t !== null).length;
    console.log(`Parsed ${obs.length} rows, ${withData} have temperature.`);

    if (withData === 0) return console.log("ℹ️ No temperature data for this day on Meteociel.");

    const toInsert = [];
    for (const ts of missing) {
        const utcObj = new Date(ts);
        const localObj = new Date(utcObj.getTime() + 60 * 60 * 1000); // CET (+1)
        const lH = localObj.getUTCHours();
        const lM = localObj.getUTCMinutes();

        const match = obs.find(o => o.hour === lH && Math.abs(o.minute - lM) <= 3 && o.t !== null);
        if (match) {
            toInsert.push({
                station_id: stationId,
                timestamp: ts,
                t: match.t, u: match.u, td: match.td, ff: match.ff, fxi: match.fxi, pres: match.pres, rr_per: match.rr
            });
        }
    }

    if (toInsert.length > 0) {
        const { error: e2 } = await supabase.from('observations_6mn').upsert(toInsert, { onConflict: 'station_id, timestamp', ignoreDuplicates: true });
        if (e2) console.error("Upsert failed:", e2.message); else console.log(`🚀 Success: ${toInsert.length} points filled.`);
    } else {
        console.log("ℹ️ None of the missing points match available data on Meteociel.");
    }
}

async function run() {
    const douai = '59178001';
    // Let's broaden the range to find any gap
    const start = new Date('2026-02-01');
    const today = new Date();
    let iter = new Date(start);
    while (iter <= today) {
        await fillGapsForDay(douai, iter.toISOString().split('T')[0]);
        iter.setDate(iter.getDate() + 1);
    }
}
run();
