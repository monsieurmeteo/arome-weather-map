import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Clés Météo-France
const METEO_KEY = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const METEO_SECRET = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('PROJECT_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log("🚀 START: Smart Update Hourly");

        // 1. Get Token
        const { data: secrets } = await supabase
            .from('api_secrets')
            .select('access_token')
            .eq('provider', 'meteo_france')
            .single();

        let token = secrets?.access_token;

        const callApi = async (dateStr: string, currentToken: string) => {
            const url = `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/horaire?date=${dateStr}&format=json`;
            return await fetch(url, { headers: { 'Authorization': `Bearer ${currentToken}` } });
        };

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

        // 2. Determine Missing Slots (Smart Logic)
        const { data: lastRecord } = await supabase
            .from('observations_horaire')
            .select('timestamp')
            .order('timestamp', { ascending: false })
            .limit(1);

        // If DB empty, start 6 hours ago.
        const lastTs = lastRecord?.[0]?.timestamp ? new Date(lastRecord[0].timestamp) : new Date(Date.now() - 6 * 60 * 60 * 1000);
        const now = new Date();

        // Stop at T-30 min (API delay safety for hourly)
        const limitDate = new Date(now.getTime() - 30 * 60000);

        const slotsToFetch: Date[] = [];
        let reader = new Date(lastTs.getTime() + 60 * 60000); // Check 1h after last
        reader.setMinutes(0, 0, 0);

        while (reader <= limitDate) {
            if (reader > lastTs) {
                slotsToFetch.push(new Date(reader));
            }
            reader = new Date(reader.getTime() + 60 * 60000);
            if (slotsToFetch.length >= 3) break; // Fetch max 3 hours per run
        }

        if (slotsToFetch.length === 0) {
            console.log("✅ Hourly Up to date.");
            return new Response(JSON.stringify({ status: "Up to date" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        console.log(`📥 Fetching ${slotsToFetch.length} hourly slots: ${slotsToFetch.map(d => d.toISOString()).join(', ')}`);

        let totalInserted = 0;

        for (const slot of slotsToFetch) {
            const dateStr = slot.toISOString().split('.')[0] + 'Z';
            let res = await callApi(dateStr, token);

            if (res.status === 401) {
                token = await refreshToken();
                res = await callApi(dateStr, token);
            }

            if (!res.ok) {
                console.log(`⚠️ Skip ${dateStr}: API status ${res.status}`);
                continue;
            }

            const data = await res.json();
            if (!Array.isArray(data)) continue;

            const rows = data.map((obs: any) => ({
                station_id: obs.id || obs.id_station || obs.geo_id_insee,
                timestamp: obs.validity_time,
                t: obs.t ? Math.round((obs.t - 273.15) * 10) / 10 : null,
                td: obs.td ? Math.round((obs.td - 273.15) * 10) / 10 : null,
                u: obs.u || null,
                ff: obs.ff ? Math.round(obs.ff * 3.6) : null,
                fxi: obs.fxi ? Math.round(obs.fxi * 3.6) : null,
                dd: obs.dd || null,
                pres: obs.pres || null,
                rr1: obs.rr1 || 0
            })).filter((r: any) => r.station_id);

            const { error } = await supabase.from('observations_horaire').upsert(rows, { onConflict: 'station_id, timestamp' });
            if (!error) {
                totalInserted += rows.length;
                console.log(`✅ ${rows.length} inserted for ${dateStr}`);
            } else {
                console.error(`❌ DB Error: ${error.message}`);
            }
        }

        return new Response(
            JSON.stringify({ success: true, processed: slotsToFetch.length, inserted: totalInserted }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('❌ FATAL:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});
