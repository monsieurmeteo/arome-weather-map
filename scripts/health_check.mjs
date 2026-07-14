/**
 * health_check.mjs — Diagnostic complet de santé Supabase
 * Usage : node scripts/health_check.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquantes dans .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Calcul de la date locale Paris (Europe/Paris = UTC+1 hiver, UTC+2 été)
function getParisDateInfo() {
    const now = new Date();
    // Méthode fiable : utiliser Intl.DateTimeFormat
    const parisFormatter = new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Europe/Paris',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
    const parts = parisFormatter.formatToParts(now);
    const get = (type) => parts.find(p => p.type === type)?.value;
    const parisDateStr = `${get('year')}-${get('month')}-${get('day')}`;
    const parisTimeStr = `${get('hour')}:${get('minute')}`;

    // Calcul de l'offset en heures
    const utcMs = now.getTime();
    const parisDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const offsetHours = Math.round((parisDate - utcDate) / (60 * 60 * 1000));

    // Heure UTC correspondant à minuit Paris d'aujourd'hui
    const parisToday = new Date(`${parisDateStr}T00:00:00`);
    const parisTodayUTC = new Date(parisToday.getTime() - offsetHours * 60 * 60 * 1000);

    return {
        parisDate: parisDateStr,
        parisTime: parisTimeStr,
        utcNow: now.toISOString(),
        offsetHours,
        todayStartUTC: parisTodayUTC.toISOString(),
        todayEndUTC: new Date(parisTodayUTC.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString(),
        yesterdayDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
            .toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' }),
    };
}

async function runHealthCheck() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║         🏥 DIAGNOSTIC DE SANTÉ SUPABASE                  ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const paris = getParisDateInfo();
    console.log(`⏰ Heure actuelle`);
    console.log(`   Paris  : ${paris.parisDate} ${paris.parisTime} (UTC${paris.offsetHours >= 0 ? '+' : ''}${paris.offsetHours})`);
    console.log(`   UTC    : ${paris.utcNow}`);
    console.log(`   Fenêtre locale "aujourd'hui" : ${paris.todayStartUTC} → ${paris.todayEndUTC}\n`);

    let ok = 0, warn = 0, errors = 0;

    // ──────────────────────────────────────────────
    // 1. OBSERVATIONS_6MN — Volume & fraîcheur
    // ──────────────────────────────────────────────
    console.log('━━━ 1. TABLE observations_6mn (données temps réel) ━━━');

    const { count: totalObs } = await supabase
        .from('observations_6mn')
        .select('*', { count: 'exact', head: true });
    console.log(`   📦 Volume total : ${totalObs?.toLocaleString() ?? '?'} lignes`);
    if (totalObs > 1_500_000) {
        console.log(`   ⚠️  ATTENTION : table très volumineuse (seuil sécurité : 1 500 000)`);
        warn++;
    } else {
        console.log(`   ✅ Volume dans les limites`);
        ok++;
    }

    // Dernière observation reçue
    const { data: lastObs } = await supabase
        .from('observations_6mn')
        .select('timestamp, station_id, t')
        .order('timestamp', { ascending: false })
        .limit(1);
    if (lastObs?.[0]) {
        const lastTs = new Date(lastObs[0].timestamp);
        const lagMin = Math.round((Date.now() - lastTs.getTime()) / 60000);
        console.log(`   🕐 Dernière obs reçue : ${lastTs.toISOString()} (il y a ${lagMin} min)`);
        if (lagMin > 30) {
            console.log(`   ⚠️  Retard important (>${lagMin}min) — vérifier le sync_summaries workflow`);
            warn++;
        } else {
            console.log(`   ✅ Données fraîches`);
            ok++;
        }
    } else {
        console.log(`   ❌ Aucune observation trouvée !`);
        errors++;
    }

    // ── Diagnostic du trou 00h-02h (sujet du bug) ──
    console.log(`\n   🔍 Diagnostic trou 00h-02h (fenêtre Paris locale):`);
    // On cherche des obs entre minuit Paris et 02h Paris
    const gap_start = paris.todayStartUTC;
    const gap_end = new Date(new Date(paris.todayStartUTC).getTime() + 2 * 60 * 60 * 1000).toISOString();

    const { count: obsIn0002 } = await supabase
        .from('observations_6mn')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', gap_start)
        .lt('timestamp', gap_end);

    console.log(`   Observations entre 00h00 et 02h00 Paris (UTC: ${gap_start.substring(11,16)}→${gap_end.substring(11,16)}) : ${obsIn0002 ?? '?'} lignes`);
    if (!obsIn0002 || obsIn0002 < 100) {
        console.log(`   ❌ TROU CONFIRMÉ : données 00h-02h absentes ou insuffisantes !`);
        errors++;
    } else {
        console.log(`   ✅ Données 00h-02h présentes`);
        ok++;
    }

    // ──────────────────────────────────────────────
    // 2. DAILY_SUMMARIES — Couverture du jour
    // ──────────────────────────────────────────────
    console.log('\n━━━ 2. TABLE daily_summaries (données cartes) ━━━');

    const { count: todaySummaries } = await supabase
        .from('daily_summaries')
        .select('*', { count: 'exact', head: true })
        .eq('date', paris.parisDate);

    console.log(`   📊 Résumés pour aujourd'hui (${paris.parisDate}) : ${todaySummaries ?? '?'} stations`);
    if (!todaySummaries || todaySummaries < 500) {
        console.log(`   ⚠️  Peu de stations résumées (attendu : ~2000+)`);
        warn++;
    } else {
        console.log(`   ✅ Bonne couverture`);
        ok++;
    }

    // Vérifier la fraîcheur du dernier résumé calculé
    const { data: lastSummary } = await supabase
        .from('daily_summaries')
        .select('updated_at, station_id, temp_max')
        .eq('date', paris.parisDate)
        .order('updated_at', { ascending: false })
        .limit(1);

    if (lastSummary?.[0]?.updated_at) {
        const updatedAt = new Date(lastSummary[0].updated_at);
        const lagMin = Math.round((Date.now() - updatedAt.getTime()) / 60000);
        console.log(`   🕐 Dernier résumé calculé il y a : ${lagMin} min (station: ${lastSummary[0].station_id})`);
        if (lagMin > 20) {
            console.log(`   ⚠️  Résumés pas frais — le workflow sync-summaries semble en retard`);
            warn++;
        } else {
            console.log(`   ✅ Résumés récents`);
            ok++;
        }
    }

    // Vérifier hier aussi
    const { count: yesterdaySummaries } = await supabase
        .from('daily_summaries')
        .select('*', { count: 'exact', head: true })
        .eq('date', paris.yesterdayDate);
    console.log(`   📊 Résumés pour hier (${paris.yesterdayDate}) : ${yesterdaySummaries ?? '?'} stations`);

    // ──────────────────────────────────────────────
    // 3. ARCHIVAGE STORAGE
    // ──────────────────────────────────────────────
    console.log('\n━━━ 3. ARCHIVAGE STORAGE (observations-archives) ━━━');
    const [y, m] = paris.yesterdayDate.split('-');

    const { data: archiveFiles, error: archError } = await supabase.storage
        .from('observations-archives')
        .list(`6mn/${y}/${m}`);

    if (archError) {
        console.log(`   ❌ Erreur accès storage : ${archError.message}`);
        errors++;
    } else if (archiveFiles && archiveFiles.length > 0) {
        const sorted = [...archiveFiles].sort((a, b) => b.name.localeCompare(a.name));
        console.log(`   ✅ ${archiveFiles.length} fichiers en ${y}/${m} — dernier : ${sorted[0].name}`);
        ok++;
    } else {
        console.log(`   ⚠️  Aucun fichier d'archive pour ${y}/${m}`);
        warn++;
    }

    // ──────────────────────────────────────────────
    // 4. VIGILANCE STATUS
    // ──────────────────────────────────────────────
    console.log('\n━━━ 4. VIGILANCE STATUS ━━━');
    const { count: vigilCount, data: vigilData } = await supabase
        .from('vigilance_status')
        .select('*', { count: 'exact', head: false })
        .eq('period', 0);

    if (vigilCount !== null) {
        const alertDepts = vigilData?.filter(d => d.level >= 3) || [];
        console.log(`   ✅ ${vigilCount} départements — ${alertDepts.length} en vigilance orange/rouge`);
        ok++;
    } else {
        console.log(`   ❌ Table vigilance_status inaccessible`);
        errors++;
    }

    // ──────────────────────────────────────────────
    // BILAN FINAL
    // ──────────────────────────────────────────────
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log(`║  BILAN : ✅ ${ok} OK  ⚠️  ${warn} Avertissements  ❌ ${errors} Erreurs  ║`);
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    if (errors > 0) process.exit(1);
    if (warn > 0) process.exit(0);
    process.exit(0);
}

runHealthCheck().catch(err => {
    console.error('❌ Erreur fatale :', err.message);
    process.exit(1);
});
