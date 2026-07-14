import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('PROJECT_URL')!;
        const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY')!;
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        console.log("📡 Archive Radar: Récupération des données RainViewer...");

        const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
        if (!res.ok) throw new Error(`RainViewer API Error: ${res.status}`);

        const data = await res.json();
        if (!data.radar || !data.radar.past) {
            throw new Error("Données radar past non disponibles");
        }

        // Extraire tous les timestamps passés
        const timestamps = data.radar.past.map((item: any) => ({
            ts_value: item.time
        }));

        console.log(`🔎 ${timestamps.length} timestamps trouvés. Sauvegarde en DB...`);

        // Upsert pour ne pas avoir de doublons (ts_value est UNIQUE)
        const { error } = await supabase
            .from('radar_history')
            .upsert(timestamps, { onConflict: 'ts_value' });

        if (error) throw error;

        return new Response(JSON.stringify({
            success: true,
            captured: timestamps.length,
            latest: timestamps[timestamps.length - 1].ts_value
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Radar Archive Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }
});
