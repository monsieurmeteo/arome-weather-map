
// ROBOT SUPREME : SCANNER TOUTE LA FRANCE (3000 Stations)
// Version 1.1 : Compatible CSV & JSON

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const METEO_FRANCE_API = 'https://public-api.meteofrance.fr/public/DPObs/v1';

Deno.serve(async (req) => {
    // 1. Initialisation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        console.log("🌍 Démarrage du SCAN NATIONAL...");

        // 2. Récupérer le Token Météo France depuis la base
        const { data: secrets } = await supabase
            .from('api_secrets')
            .select('access_token')
            .eq('provider', 'meteo_france')
            .single();

        const token = secrets?.access_token;
        if (!token) throw new Error("Pas de token Météo France trouvé dans la table api_secrets !");

        // 3. Récupérer la LISTE OFFICIELLE de toutes les stations
        const listUrl = `${METEO_FRANCE_API}/liste-stations?format=json`;
        console.log(`📋 Téléchargement de la liste officielle : ${listUrl}`);

        const listResp = await fetch(listUrl, { headers: { 'apikey': token } });

        let stationsToScan: string[] = [];

        if (listResp.ok) {
            const contentType = listResp.headers.get("content-type") || "";
            const textData = await listResp.text();

            if (contentType.includes("json") || textData.trim().startsWith("[")) {
                // C'est bien du JSON
                try {
                    const listData = JSON.parse(textData);
                    if (Array.isArray(listData)) {
                        stationsToScan = listData.map((s: any) => s.id_station);
                    }
                } catch (e) {
                    console.error("Erreur parsing JSON", e);
                }
            } else {
                // C'est du CSV (Fallback si l'API ignore ?format=json)
                console.log("⚠️ Format CSV détecté, parsing manuel...");
                const lines = textData.split('\n');
                // Format CSV : id_station;nom;... on prend la colonne 0
                stationsToScan = lines
                    .slice(1) // On saute l'en-tête
                    .map(line => line.split(';')[0])
                    .filter(id => id && id.length >= 5); // On garde les ID valides
            }

            console.log(`✅ Liste récupérée : ${stationsToScan.length} stations détectées en France.`);
        } else {
            console.error("❌ Echec liste officielle. Code:", listResp.status);
            throw new Error("Impossible de lire la liste des stations.");
        }

        // 4. SCAN MASSIF (Par paquets pour aller vite)
        // On traite 50 stations en parallèle.
        const BATCH_SIZE = 50;
        let totalProcessed = 0;
        let totalSaved = 0;

        // Fonction unitaire
        const processStation = async (id: string) => {
            try {
                // On demande la dernière donnée disponible
                const url = `${METEO_FRANCE_API}/station/horaire?id_station=${id}&format=json`;
                const r = await fetch(url, { headers: { 'apikey': token } });
                if (!r.ok) return 0;

                const d = await r.json();
                const items = Array.isArray(d) ? d : [d];
                if (items.length === 0) return 0;

                // Conversion
                const rows = items.map((obs: any) => ({
                    station_id: id,
                    timestamp: new Date(obs.validity_time || obs.date_obs).toISOString(),
                    t: obs.t !== undefined ? Math.round((obs.t - 273.15) * 10) / 10 : null,
                    td: obs.td !== undefined ? Math.round((obs.td - 273.15) * 10) / 10 : null,
                    u: obs.u,
                    ff: obs.ff !== undefined ? Math.round(obs.ff * 3.6) : null,
                    fxi: (obs.fxi || obs.fxi10) !== undefined ? Math.round((obs.fxi || obs.fxi10) * 3.6) : null,
                    dd: obs.dd,
                    rr1: obs.rr1 ?? 0,
                    pres: obs.pres
                }));

                // Sauvegarde DB
                const { error } = await supabase.from('observations_horaire').upsert(rows, { onConflict: 'station_id, timestamp', ignoreDuplicates: true });
                return error ? 0 : rows.length;
            } catch {
                return 0;
            }
        };

        // Boucle principale
        for (let i = 0; i < stationsToScan.length; i += BATCH_SIZE) {
            const chunk = stationsToScan.slice(i, i + BATCH_SIZE);
            const promises = chunk.map(id => processStation(id));
            const results = await Promise.all(promises); // Parallélisation

            totalProcessed += chunk.length;
            totalSaved += results.reduce((a, b) => a + b, 0);

            if (totalProcessed % 500 === 0) {
                console.log(`... ${totalProcessed} / ${stationsToScan.length} stations traitées.`);
            }
        }

        console.log(`🎉 TERMINÉ ! ${totalSaved} données enregistrées.`);

        return new Response(JSON.stringify({
            success: true,
            stations_total: stationsToScan.length,
            saved_points: totalSaved
        }), { headers: { "Content-Type": "application/json" } });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
});
