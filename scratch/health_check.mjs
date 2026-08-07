import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

console.log('\n══════════════════════════════════════════════════════');
console.log('   BILAN SANTÉ SUPABASE — observations 6mn');
console.log('══════════════════════════════════════════════════════\n');

// 1. Estimation rapide du nombre de lignes
const { data: estCount } = await sb.rpc('get_observations_count');
console.log(`📊 Lignes estimées (pg_class) : ${Number(estCount).toLocaleString('fr-FR')}`);

// 2. Fraîcheur des données : dernières 5 lignes
const { data: latest, error: latestErr } = await sb
    .from('observations_6mn')
    .select('station_id, timestamp')
    .order('timestamp', { ascending: false })
    .limit(5);

if (latestErr) {
    console.log('❌ Impossible de lire observations_6mn :', latestErr.message);
} else {
    console.log('\n📡 Dernières observations reçues :');
    latest.forEach(r => {
        const ageSec = Math.round((Date.now() - new Date(r.timestamp)) / 1000);
        const ageMin = Math.floor(ageSec / 60);
        const ageSecs = ageSec % 60;
        console.log(`   • ${r.station_id.padEnd(10)} ${r.timestamp}  (il y a ${ageMin}m ${ageSecs}s)`);
    });

    const newestMs = Date.now() - new Date(latest[0]?.timestamp);
    const newestMin = Math.round(newestMs / 60000);
    console.log('');
    if (newestMin <= 12) {
        console.log(`✅ COLLECTE ACTIVE  — donnée la plus récente : il y a ${newestMin} minutes`);
    } else if (newestMin <= 30) {
        console.log(`⚠️  LÉGER RETARD    — donnée la plus récente : il y a ${newestMin} minutes`);
    } else {
        console.log(`🔴 COLLECTE EN PANNE — donnée la plus récente : il y a ${newestMin} minutes`);
    }
}

// 3. Vérification du nombre de postes actifs aujourd'hui
const now = new Date();
const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
const { count: activeStations } = await sb
    .from('observations_6mn')
    .select('station_id', { count: 'exact', head: true })
    .gte('timestamp', todayStart);

console.log(`\n🏭 Postes ayant émis aujourd'hui : ${activeStations?.toLocaleString('fr-FR') || '?'} observations (toutes stations)`);

// 4. Vérification des daily_summaries
const { data: lastSum } = await sb
    .from('daily_summaries')
    .select('date')
    .order('date', { ascending: false })
    .limit(1);

const lastDate = lastSum?.[0]?.date;
const dayDiff = lastDate ? Math.round((Date.now() - new Date(lastDate)) / 86400000) : 99;
if (dayDiff <= 1) {
    console.log(`✅ Daily summaries  — dernière date : ${lastDate} (à jour)`);
} else {
    console.log(`⚠️  Daily summaries  — dernière date : ${lastDate} (retard ${dayDiff}j)`);
}

// 5. Vérification limite de stockage
const limit = 300000;
const used = Number(estCount);
const pct = Math.round((used / limit) * 100);
console.log(`\n💾 Utilisation stockage table principale :`);
console.log(`   ${used.toLocaleString('fr-FR')} / ${limit.toLocaleString('fr-FR')} lignes (${pct}%)`);
const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
console.log(`   [${bar}] ${pct}%`);
if (pct < 90) console.log('   ✅ Espace disponible — pas de risque de saturation immédiat');
else console.log('   🔴 ATTENTION : Presque plein !');

// 6. Retention estimée : combien de jours couvre la table ?
const { data: oldest } = await sb
    .from('observations_6mn')
    .select('timestamp')
    .order('timestamp', { ascending: true })
    .limit(1);

if (oldest?.[0]) {
    const retentionDays = Math.round((Date.now() - new Date(oldest[0].timestamp)) / 86400000);
    console.log(`\n📅 Rétention des données :`);
    console.log(`   Observation la plus ancienne : ${oldest[0].timestamp}`);
    console.log(`   → Historique conservé : ~${retentionDays} jours`);
}

console.log('\n══════════════════════════════════════════════════════\n');
