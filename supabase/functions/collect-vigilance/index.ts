import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Météo-France API Keys (Same as collect-6mn)
const METEO_KEY = 'Mhar9YSs8LEluq4neXqP0YeHaaka';
const METEO_SECRET = 'nDKPWzVr2_2o5Ej1aPZa7O6hu4Ia';

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('PROJECT_URL')!;
        const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')!;
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        console.log("🚀 Lancement de la collecte Vigilance (v2 - Bearer Token)...");

        // 1. Get Token from DB or Refresh
        const { data: secrets } = await supabase
            .from('api_secrets')
            .select('access_token, updated_at')
            .eq('provider', 'meteo_france')
            .single();

        let token = secrets?.access_token;
        const lastUpdate = secrets?.updated_at ? new Date(secrets.updated_at).getTime() : 0;
        const nowTs = Date.now();

        // Refresh if older than 45 min
        if (!token || (nowTs - lastUpdate > 45 * 60 * 1000)) {
            console.log('🔄 Refreshing Météo-France Token for Vigilance...');
            const auth = btoa(`${METEO_KEY}:${METEO_SECRET}`);
            const resT = await fetch('https://portail-api.meteofrance.fr/token', {
                method: 'POST',
                headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'grant_type=client_credentials'
            });
            if (!resT.ok) throw new Error('Token refresh failed');
            const dataT = await resT.json();
            token = dataT.access_token;
            await supabase.from('api_secrets').upsert({ provider: 'meteo_france', access_token: token, updated_at: new Date().toISOString() });
        }

        const fetchHeaders = {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        };

        // 2. Fetch Carte
        const mapRes = await fetch("https://public-api.meteofrance.fr/public/DPVigilance/v1/cartevigilance/encours", {
            headers: fetchHeaders
        });
        if (!mapRes.ok) throw new Error(`MF API Map Error: ${mapRes.status}`);
        const mapData = await mapRes.json();
        console.log(`📊 Map Data Periods: ${mapData.product.periods.length}`);

        // 3. Fetch Bulletins
        let textData: any = { product: { text_bloc_items: [] } };
        const textRes = await fetch("https://public-api.meteofrance.fr/public/DPVigilance/v1/textesvigilance/encours", {
            headers: fetchHeaders
        });

        if (textRes.ok) {
            textData = await textRes.json();
        } else {
            console.warn(`⚠️ Erreur non-bloquante lors du fetch des textes: ${textRes.status}`);
        }

        // 4. Fetch Météo des forêts
        let foretData: any[] = [];
        try {
            console.log("🌲 Récupération de la Météo des forêts...");
            const foretRes = await fetch("https://public-api.meteofrance.fr/public/DPMeteoForets/v1/carte/departement/encours?format=json", {
                headers: fetchHeaders
            });
            if (foretRes.ok) {
                foretData = await foretRes.json();
                console.log(`✅ Météo des forêts récupérée : ${foretData.length} départements.`);
            } else {
                console.warn(`⚠️ Erreur non-bloquante lors du fetch Météo des forêts: ${foretRes.status}`);
            }
        } catch (err) {
            console.warn(`⚠️ Erreur non-bloquante lors de la récupération Météo des forêts:`, err.message);
        }

        // --- Process Maps ---
        let allUpsertData = [];
        if (mapData && mapData.product && mapData.product.periods) {
            mapData.product.periods.forEach((period: any, periodIdx: number) => {
                if (!period.timelaps || !period.timelaps.domain_ids) return;
                const domains = period.timelaps.domain_ids;
                const upsertData = domains.map((domain: any) => {
                    const depCode = domain.domain_id;
                    const risks = domain.phenomenon_items?.map((p: any) => ({
                        id: p.phenomenon_id,
                        level: p.phenomenon_max_color_id,
                        timelines: p.timelaps_items
                    })) || [];

                    // Intégration du danger feux de forêt (identifiant "100")
                    const depForet = foretData.find((f: any) => f.dep_code === depCode);
                    if (depForet) {
                        const levelVal = periodIdx === 0 ? parseInt(depForet.niveau_j1) : parseInt(depForet.niveau_j2);
                        if (!isNaN(levelVal)) {
                            risks.push({
                                id: "100", // Météo des forêts
                                level: levelVal
                            });
                        }
                    }

                    return {
                        dep_code: depCode,
                        period: periodIdx,
                        level: domain.max_color_id,
                        start_time: period.begin_validity_time,
                        end_time: period.end_validity_time,
                        risks: risks,
                        last_update: new Date().toISOString()
                    };
                });
                allUpsertData.push(...upsertData);
            });
        }

        if (allUpsertData.length > 0) {
            await supabase.from('vigilance_status').upsert(allUpsertData, { onConflict: 'dep_code, period' });
        }

        // --- Process Bulletins ---
        let bulletins = [];
        if (textData.product && textData.product.text_bloc_items) {
            textData.product.text_bloc_items.forEach((bloc: any) => {
                const domainId = bloc.domain_id === 'FRA' ? 'france' : bloc.domain_id;
                if (bloc.bloc_items) {
                    bloc.bloc_items.forEach((item: any) => {
                        const contentParts: string[] = [];
                        if (item.text_items) {
                            item.text_items.forEach((ti: any) => {
                                const extractFromObj = (obj: any) => {
                                    if (!obj) return;
                                    if (obj.bold_text) contentParts.push(`**${obj.bold_text}**`);
                                    if (Array.isArray(obj.text)) {
                                        obj.text.forEach((t: string) => contentParts.push(t));
                                    }
                                };
                                extractFromObj(ti);
                                if (Array.isArray(ti.term_items)) {
                                    ti.term_items.forEach((term: any) => extractFromObj(term));
                                }
                                contentParts.push("");
                            });
                        }

                        bulletins.push({
                            domain_id: domainId,
                            text_type: item.id,
                            title: item.title || item.type_name || 'Bulletin Vigilance',
                            content: contentParts.join('\n').trim(),
                            update_time: textData.product.update_time
                        });
                    });
                }
            });
        }

        if (bulletins.length > 0) {
            await supabase.from('vigilance_bulletins').upsert(bulletins, { onConflict: 'domain_id, text_type' });
        }

        return new Response(JSON.stringify({
            success: true,
            status_updated: allUpsertData.length,
            bulletins_updated: bulletins.length
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Vigilance Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
