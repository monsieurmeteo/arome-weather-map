import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Clés API Météo-France (Si Token invalide, on regénère)
const METEO_KEY = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const METEO_SECRET = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('PROJECT_URL')!;
        const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')!; // Nom autorisé
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log("🚀 START: Smart Update 6mn (Rolling 72m)");

        // 1. Get Token
        const { data: secrets } = await supabase
            .from('api_secrets')
            .select('access_token')
            .eq('provider', 'meteo_france')
            .single();

        let token = secrets?.access_token;

        // ⚡ API v2 : raf10 remplace fxi10 depuis le 16/06/2026
        const callApiBulk = async (dateStr: string, currentToken: string) => {
            const url = `https://public-api.meteofrance.fr/public/DPPaquetObs/v2/paquet/stations/infrahoraire-6m?date=${dateStr}&format=json`;
            return await fetch(url, { headers: { 'Authorization': `Bearer ${currentToken}` } });
        };

        // Function call API (Individual - for missing priority stations)
        const callApiIndividual = async (stationId: string, dateStr: string, currentToken: string) => {
            const url = `https://public-api.meteofrance.fr/public/DPObs/v2/station/infrahoraire-6m?id_station=${stationId}&date=${dateStr}&format=json`;
            return await fetch(url, { headers: { 'Authorization': `Bearer ${currentToken}` } });
        };

        // Function Refresh Token
        const refreshToken = async () => {
            console.log('🔄 Refreshing Token...');
            const auth = btoa(`${METEO_KEY}:${METEO_SECRET}`);
            const res = await fetch('https://portail-api.meteofrance.fr/token', {
                method: 'POST',
                headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'grant_type=client_credentials'
            });
            if (!res.ok) throw new Error('Token refresh failed');
            const data = await res.json();
            await supabase.from('api_secrets').upsert({ provider: 'meteo_france', access_token: data.access_token, updated_at: new Date().toISOString() });
            return data.access_token;
        };

        // 2. Determine Rolling Lookback Slots (Rolling 96 minutes window shifted by 1 minute for publication lag)
        const now = new Date();
        const startPoint = new Date(Math.floor(now.getTime() / 360000) * 360000 - 96 * 60000); 
        const limitDate = new Date(now.getTime() - 1 * 60000); 

        const slotsToFetch: Date[] = [];
        let reader = new Date(startPoint);

        while (reader <= limitDate) {
            reader.setMinutes(Math.floor(reader.getMinutes() / 6) * 6, 0, 0);
            slotsToFetch.push(new Date(reader));
            reader = new Date(reader.getTime() + 6 * 60000);
        }

        if (slotsToFetch.length === 0) {
            console.log("✅ Up to date.");
            return new Response(JSON.stringify({ status: "Up to date" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        console.log(`📥 Fetching ${slotsToFetch.length} rolling slots: ${slotsToFetch.map(d => d.toISOString()).join(', ')}`);

        // Get only the PRIORITY stations from DB to avoid fetching 2000+ indiv calls
        // In this case, we'll fetch only a small set if missing.
        const PRIORITY_IDS = ['59343001', '59178001', '59350001', '35281001']; // Lille, Douai, Rennes...

        let totalInserted = 0;

        for (let i = 0; i < slotsToFetch.length; i++) {
            const slot = slotsToFetch[i];
            const isLatest = (i === slotsToFetch.length - 1);
            const dateStr = slot.toISOString().split('.')[0] + 'Z';
            let allBatchData: any[] = [];
            let bulkStationsIds = new Set();

            // 1. Appel Bulk
            let res = await callApiBulk(dateStr, token);
            if (res.status === 401) {
                token = await refreshToken();
                res = await callApiBulk(dateStr, token);
            }

            if (res.ok) {
                const bulkData = await res.json();
                if (Array.isArray(bulkData)) {
                    allBatchData = [...bulkData];
                    bulkData.forEach(obs => {
                        const sid = obs.id || obs.id_station || obs.geo_id_insee;
                        if (sid) bulkStationsIds.add(sid);
                    });
                }
            } else {
                console.error(`❌ Bulk API failed for ${dateStr}: ${res.status}`);
            }

            // 2. Individual fetch ONLY for priority stations and ONLY for the latest slot (to save time)
            if (isLatest) {
                const missingPriority = PRIORITY_IDS.filter(sid => !bulkStationsIds.has(sid));
                if (missingPriority.length > 0) {
                    console.log(`🔍 Fetching ${missingPriority.length} priority stations individually for ${dateStr}...`);
                    for (const sid of missingPriority) {
                        try {
                            const resIndiv = await callApiIndividual(sid, dateStr, token);
                            if (resIndiv.ok) {
                                const indivData = await resIndiv.json();
                                if (Array.isArray(indivData) && indivData[0]) {
                                    allBatchData.push({ ...indivData[0], _source: 'indiv' });
                                }
                            }
                        } catch (e) {
                            console.log(`❌ Error fetching indiv station ${sid}:`, (e as any).message);
                        }
                        await new Promise(r => setTimeout(r, 200)); // Faster delay for fewer stations
                    }
                }
            }

            if (allBatchData.length === 0) continue;

            const rows = allBatchData.map((obs: any) => {
                const stationId = obs.id || obs.id_station || obs.geo_id_insee;
                return {
                    station_id: stationId,
                    timestamp: new Date(obs.validity_time || dateStr).toISOString(),
                    t: obs.t != null ? Math.round((obs.t - 273.15) * 10) / 10 : null,
                    td: obs.td != null ? Math.round((obs.td - 273.15) * 10) / 10 : null,
                    u: obs.u != null ? obs.u : null,
                    ff: obs.ff != null ? Math.round(obs.ff * 3.6) : null,
                    // raf10 = rafale sur 10 min (API v2, remplace fxi10 depuis 16/06/2026)
                    fxi: obs.raf10 != null ? Math.round(obs.raf10 * 3.6)
                       : obs.fxi10 != null ? Math.round(obs.fxi10 * 3.6)
                       : obs.fxi   != null ? Math.round(obs.fxi   * 3.6) : null,
                    dd: obs.dd != null ? obs.dd : null,
                    pres: obs.pmer != null ? Math.round(obs.pmer / 100 * 10) / 10 : (obs.pres != null ? Math.round(obs.pres / 100 * 10) / 10 : null),
                    rr_per: obs.rr_per != null ? obs.rr_per : 0
                };
            }).filter((r: any) => r.station_id);

            const { error: upsertError } = await supabase.from('observations_6mn').upsert(rows, { onConflict: 'station_id, timestamp' });
            if (!upsertError) {
                totalInserted += rows.length;
                console.log(`✅ ${rows.length} inserted for ${dateStr}`);
            }
        }

        if (totalInserted > 0) {
            console.log(`[CRON] Déclenchement de la synchronisation des résumés daily_summaries...`);
            const todayStr = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris' }).format(new Date());
            const { error: syncError } = await supabase.rpc('batch_sync_daily_summaries', { target_date: todayStr });
            if (syncError) console.error("   ❌ Erreur sync RPC :", syncError.message);
            else console.log("   ✅ Synchronisation des résumés terminée avec succès.");
        }

        return new Response(
            JSON.stringify({ success: true, processed: slotsToFetch.length, inserted: totalInserted }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('❌ FATAL:', error);
        return new Response(
            JSON.stringify({ error: (error as any).message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
