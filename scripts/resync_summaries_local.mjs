import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// =========================================================
// LOGIQUE DE SÉCURITÉ :
// - On ne supprime JAMAIS les données récentes (< 48h)
// - Le script d'archive (02h30) s'occupe de l'archivage
// - Limite haute : 1 500 000 lignes (≈ 3 jours × ~2000 stations × 240 obs/j)
// =========================================================
const MAX_ROWS_OBSERVATIONS = 1_500_000;
const ARCHIVE_THRESHOLD_HOURS = 24;

// ─────────────────────────────────────────────────────────
// UTILITAIRE TIMEZONE : date locale Paris (UTC+1 hiver / UTC+2 été)
// ⚠️ GitHub Actions tourne en UTC — on calcule manuellement
//    l'offset Europe/Paris pour éviter le trou 00h-02h local
// ─────────────────────────────────────────────────────────
function getParisDayWindow() {
    const now = new Date();

    // Date du jour à Paris (format YYYY-MM-DD) via Intl.DateTimeFormat
    const parisDateStr = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Europe/Paris'
    }).format(now);

    // Calcul de l'offset Europe/Paris en ms
    const parisNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    const utcNow   = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const offsetMs = parisNow.getTime() - utcNow.getTime();
    const offsetHours = Math.round(offsetMs / (60 * 60 * 1000));

    // Minuit Paris en UTC = minuit "Paris local" - offset
    // Ex : UTC+2 → minuit Paris = 22h00 UTC de la veille
    const startUTC = new Date(new Date(`${parisDateStr}T00:00:00Z`).getTime() - offsetMs);
    const endUTC   = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000 - 1000);

    console.log(`[TZ] Europe/Paris = UTC${offsetHours >= 0 ? '+' : ''}${offsetHours} | Aujourd'hui Paris : ${parisDateStr}`);
    console.log(`[TZ] Fenêtre UTC  : ${startUTC.toISOString()} → ${endUTC.toISOString()}`);

    return { parisDate: parisDateStr, offsetMs, offsetHours, startUTC: startUTC.toISOString(), endUTC: endUTC.toISOString() };
}

// Retourne la date locale Paris (YYYY-MM-DD) d'un timestamp UTC
function getParisLocalDate(utcTimestamp, offsetMs) {
    const d = new Date(new Date(utcTimestamp).getTime() + offsetMs);
    return d.toISOString().split('T')[0];
}

// ─────────────────────────────────────────────────────────
// NETTOYAGE PRÉVENTIF (si volume trop élevé)
// ─────────────────────────────────────────────────────────
async function cleanupIfNeeded() {
    console.log("🧹 Vérification du volume d'observations_6mn...");
    try {
        const { data: countData, error: countError } = await supabase.rpc('get_observations_count');
        let count = countData;

        if (countError) {
            const { count: apiCount, error: apiErr } = await supabase
                .from('observations_6mn')
                .select('*', { count: 'estimated', head: true });
            if (apiErr) { console.warn("   ⚠️ Impossible de vérifier le volume :", apiErr.message); return; }
            count = apiCount;
        }

        if (count <= MAX_ROWS_OBSERVATIONS) {
            console.log(`   ✅ Volume OK : ~${count?.toLocaleString()} lignes (limite: ${MAX_ROWS_OBSERVATIONS.toLocaleString()})`);
            return;
        }

        const cutoff = new Date(Date.now() - ARCHIVE_THRESHOLD_HOURS * 60 * 60 * 1000).toISOString();
        console.log(`   🚨 ~${count?.toLocaleString()} lignes détectées — nettoyage des données > ${ARCHIVE_THRESHOLD_HOURS}h...`);
        console.log(`   ⚠️  Ces données auraient dû être archivées par le cron 02h30 !`);

        let totalDeleted = 0;
        for (let h = 168; h >= ARCHIVE_THRESHOLD_HOURS; h -= 6) {
            const start = new Date(Date.now() - (h + 6) * 60 * 60 * 1000).toISOString();
            const end   = new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
            const { error: delErr } = await supabase.from('observations_6mn').delete()
                .gte('timestamp', start).lt('timestamp', end);
            if (!delErr) totalDeleted++;
        }
        console.log(`   ✅ Nettoyage effectué (${totalDeleted} tranches de 6h supprimées).`);
    } catch (e) {
        console.warn("   ⚠️ Erreur nettoyage (non bloquant) :", e.message);
    }
}

// ─────────────────────────────────────────────────────────
// SYNC PRINCIPAL
// ─────────────────────────────────────────────────────────
async function localSync() {
    console.log(`\n🔄 Synchronisation résumés quotidiens — ${new Date().toISOString()}\n`);

    await cleanupIfNeeded();

    // ⚠️ FIX TIMEZONE : fenêtre calée sur la journée locale Paris, pas UTC
    // Avant ce fix : startTs = todayUTC + "T00:00:00Z" → manquait 00h-02h local en été
    const { parisDate, offsetMs, startUTC, endUTC } = getParisDayWindow();

    console.log(`\n📡 Chargement des observations du ${parisDate} (heure locale Paris)...`);

    const BATCH = 1000;
    let allRows = [], from = 0, hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('observations_6mn')
            .select('station_id, t, fxi, rr_per, timestamp')
            .gte('timestamp', startUTC)
            .lte('timestamp', endUTC)
            .range(from, from + BATCH - 1);

        if (error) { console.error("❌ Erreur chargement :", error.message); break; }

        if (data?.length > 0) {
            allRows.push(...data);
            if (data.length < BATCH) hasMore = false;
            else from += BATCH;
            if (allRows.length % 10000 === 0) console.log(`   ... ${allRows.length.toLocaleString()} lignes chargées`);
        } else {
            hasMore = false;
        }
    }

    console.log(`\n📡 Chargement des observations horaires du ${parisDate}...`);
    let hourlyRows = [], hourlyFrom = 0, hourlyHasMore = true;
    while (hourlyHasMore) {
        const { data, error } = await supabase
            .from('observations_horaire')
            .select('station_id, fxi, timestamp')
            .gte('timestamp', startUTC)
            .lte('timestamp', endUTC)
            .range(hourlyFrom, hourlyFrom + BATCH - 1);

        if (error) { console.error("❌ Erreur chargement horaires :", error.message); break; }

        if (data?.length > 0) {
            hourlyRows.push(...data);
            if (data.length < BATCH) hourlyHasMore = false;
            else hourlyFrom += BATCH;
        } else {
            hourlyHasMore = false;
        }
    }
    console.log(`   ✅ ${hourlyRows.length} observations horaires chargées.`);

    if (allRows.length === 0 && hourlyRows.length === 0) {
        console.log("ℹ️ Aucune donnée pour la période — la table est peut-être vide après nettoyage.");
        return;
    }

    console.log(`\n🧮 Calcul des résumés pour ${allRows.length.toLocaleString()} observations (${parisDate})...`);
    const stationMap = new Map();

    for (const row of allRows) {
        const sid = row.station_id;
        // Vérification : exclure les obs qui ne tombent pas dans la journée Paris locale
        // (sécurité en cas de données chevauchantes aux extrémités de la fenêtre)
        const rowParisDate = getParisLocalDate(row.timestamp, offsetMs);
        if (rowParisDate !== parisDate) continue;

        if (!stationMap.has(sid)) {
            stationMap.set(sid, {
                station_id: sid,
                date: parisDate,   // ← DATE LOCALE PARIS (pas UTC)
                temp_min: 999, temp_max: -999,
                wind_gust_max: -1, wind_gust_time: null,
                rain_total: 0
            });
        }

        const st = stationMap.get(sid);
        if (row.t   !== null && row.t   < st.temp_min)    st.temp_min = row.t;
        if (row.t   !== null && row.t   > st.temp_max)    st.temp_max = row.t;
        if (row.fxi !== null && row.fxi > st.wind_gust_max) {
            st.wind_gust_max  = row.fxi;
            st.wind_gust_time = row.timestamp;
        }
        if (row.rr_per !== null && row.rr_per > 0) st.rain_total += row.rr_per;
    }

    // Fusionner les données horaires (rafales)
    console.log(`🧮 Fusion des ${hourlyRows.length} rafales horaires...`);
    for (const row of hourlyRows) {
        const sid = row.station_id;
        const rowParisDate = getParisLocalDate(row.timestamp, offsetMs);
        if (rowParisDate !== parisDate) continue;

        if (!stationMap.has(sid)) {
            stationMap.set(sid, {
                station_id: sid,
                date: parisDate,
                temp_min: 999, temp_max: -999,
                wind_gust_max: -1, wind_gust_time: null,
                rain_total: 0
            });
        }

        const st = stationMap.get(sid);
        if (row.fxi !== null && row.fxi > st.wind_gust_max) {
            st.wind_gust_max  = row.fxi;
            st.wind_gust_time = row.timestamp;
        }
    }

    const upserts = Array.from(stationMap.values()).map(s => {
        if (s.temp_min      === 999)  s.temp_min = null;
        if (s.temp_max      === -999) s.temp_max = null;
        if (s.wind_gust_max === -1)   s.wind_gust_max = null;
        s.updated_at = new Date().toISOString();
        return s;
    });

    console.log(`\n🚀 Envoi de ${upserts.length} résumés vers daily_summaries (date: ${parisDate})...`);

    const UPSERT_BATCH = 500;
    let totalSent = 0;
    for (let i = 0; i < upserts.length; i += UPSERT_BATCH) {
        const chunk = upserts.slice(i, i + UPSERT_BATCH);
        const { error: upsertError } = await supabase
            .from('daily_summaries')
            .upsert(chunk, { onConflict: 'station_id, date' });
        if (upsertError) console.error(`❌ Erreur batch ${i}-${i + UPSERT_BATCH} :`, upsertError.message);
        else totalSent += chunk.length;
    }

    console.log(`\n✅ TERMINÉ ! ${totalSent}/${upserts.length} résumés mis à jour pour le ${parisDate}`);
}

localSync();
