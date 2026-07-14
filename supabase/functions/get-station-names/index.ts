import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('PROJECT_URL')!
        const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Récupérer le token Météo France
        const { data: secrets } = await supabase
            .from('api_secrets')
            .select('access_token')
            .eq('provider', 'meteo_france')
            .single()

        if (!secrets?.access_token) {
            return new Response(
                JSON.stringify({ error: 'No token found' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Appeler l'API Météo France pour récupérer toutes les stations
        const metaUrl = 'https://public-api.meteofrance.fr/public/DPPaquetObs/v1/liste-stations/infrahoraire-6m?format=json'
        const response = await fetch(metaUrl, {
            headers: { 'Authorization': `Bearer ${secrets.access_token}` }
        })

        if (!response.ok) {
            return new Response(
                JSON.stringify({ error: 'Failed to fetch stations' }),
                { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const allStations = await response.json()

        // Créer un mapping ID -> Nom
        const stationNames: Record<string, string> = {}
        allStations.forEach((st: any) => {
            const id = st.id || st.id_station
            const name = st.nom || st.name || ''
            const commune = st.nom_commune || st.commune || ''
            stationNames[id] = commune || name || id
        })

        return new Response(
            JSON.stringify(stationNames),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
