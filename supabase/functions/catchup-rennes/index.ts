import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const METEO_KEY = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const METEO_SECRET = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('PROJECT_URL')!;
    const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔄 Refreshing MF token...');
    const auth = btoa(`${METEO_KEY}:${METEO_SECRET}`);
    const resAuth = await fetch('https://portail-api.meteofrance.fr/token', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials'
    });
    const authData = await resAuth.json();
    const token = authData.access_token;
    console.log('Token obtained.');

    // On va restaurer les trous de 00:42 à 01:12
    const datesToRestore = [
      '2026-03-03T00:48:00Z',
      '2026-03-03T01:00:00Z'
    ];

    let totalInserted = 0;

    for (const d of datesToRestore) {
      console.log('Fetching bulk for', d);
      const url = `https://public-api.meteofrance.fr/public/DPPaquetObs/v1/paquet/stations/infrahoraire-6m?date=${d}&format=json`;
      try {
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const bulkData = await res.json();
          if (Array.isArray(bulkData)) {
            const rows = bulkData.map(obs => {
              const sid = obs.id || obs.id_station || obs.geo_id_insee;
              return {
                station_id: sid,
                timestamp: new Date(obs.validity_time || d).toISOString(),
                t: obs.t != null ? Math.round((obs.t - 273.15) * 10) / 10 : null,
                td: obs.td != null ? Math.round((obs.td - 273.15) * 10) / 10 : null,
                u: obs.u != null ? obs.u : null,
                ff: obs.ff != null ? Math.round(obs.ff * 3.6) : null,
                fxi: obs.fxi10 != null ? Math.round(obs.fxi10 * 3.6) : (obs.fxi != null ? Math.round(obs.fxi * 3.6) : null),
                dd: obs.dd != null ? obs.dd : null,
                pres: obs.pmer != null ? Math.round(obs.pmer / 100 * 10) / 10 : (obs.pres != null ? Math.round(obs.pres / 100 * 10) / 10 : null),
                rr_per: obs.rr_per != null ? obs.rr_per : 0
              };
            }).filter(r => r.station_id);

            const { error } = await supabase.from('observations_6mn').upsert(rows, { onConflict: 'station_id, timestamp' });
            if (error) console.error('DB error for', d, error);
            else {
              console.log(`✅ Restored ${rows.length} stations for ${d}`);
              totalInserted += rows.length;
            }
          }
        }
      } catch (e) { }
      await new Promise(r => setTimeout(r, 2000));
    }

    return new Response(
      JSON.stringify({ success: true, processed: datesToRestore.length, inserted: totalInserted }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as any).message }), { status: 500 });
  }
});
