import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://ubdevaemtwbzxksjlhjg.supabase.co',
    'sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR'
);

async function audit() {
    console.log('=== AUDIT SUPABASE ===\n');

    // 1. Volume total observations_6mn
    const { count: total6mn } = await supabase
        .from('observations_6mn')
        .select('*', { count: 'exact', head: true });
    console.log(`1. observations_6mn - Total lignes : ${total6mn}`);

    // 2. Plage de dates
    const { data: oldest } = await supabase
        .from('observations_6mn')
        .select('timestamp')
        .order('timestamp', { ascending: true })
        .limit(1);
    const { data: newest } = await supabase
        .from('observations_6mn')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1);
    console.log(`   Plus ancienne : ${oldest?.[0]?.timestamp}`);
    console.log(`   Plus récente  : ${newest?.[0]?.timestamp}`);

    // 3. Combien de stations distinctes aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    const { count: stationsToday } = await supabase
        .from('observations_6mn')
        .select('station_id', { count: 'exact', head: true })
        .gte('timestamp', today + 'T00:00:00Z');
    console.log(`   Stations avec data aujourd'hui : ${stationsToday} lignes`);

    // 4. Table daily_summaries
    const { count: summaries } = await supabase
        .from('daily_summaries')
        .select('*', { count: 'exact', head: true });
    console.log(`\n2. daily_summaries - Total : ${summaries} lignes`);

    // 5. Vérifier si pg_cron existe (cleanup auto)
    const { data: cronJobs, error: cronError } = await supabase.rpc('get_cron_jobs').catch(() => ({ data: null, error: 'rpc not available' }));
    if (cronError) {
        console.log(`\n3. pg_cron : non accessible via RPC (normal)`);
    } else {
        console.log(`\n3. pg_cron jobs : ${JSON.stringify(cronJobs)}`);
    }

    // 6. Taille estimée de la DB
    console.log(`\n=== PROJECTION VOLUME ===`);
    const cyclesPerDay = 24 * 10; // 10 cycles de 6mn par heure
    const stationsEstimate = 1500;
    const rowsPerDay = cyclesPerDay * stationsEstimate;
    const currentRows = total6mn || 0;
    const daysOfData = currentRows / rowsPerDay;
    console.log(`   Cycles/jour estimés : ${cyclesPerDay}`);
    console.log(`   Lignes/jour estimées : ${rowsPerDay.toLocaleString()}`);
    console.log(`   Jours de données actuels : ${daysOfData.toFixed(1)}`);
    console.log(`   Lignes après 30 jours SANS nettoyage : ${(rowsPerDay * 30).toLocaleString()}`);
}

audit();
