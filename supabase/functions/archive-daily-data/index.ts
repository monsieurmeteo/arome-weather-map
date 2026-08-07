import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('PROJECT_URL')!
    const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Déterminer la date à archiver (veille par défaut)
    const { date } = await req.json().catch(() => ({ date: null }))
    const targetDate = date || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    console.log(`📦 Archivage pour la date : ${targetDate}`)

    // 2. Récupérer TOUTES les données de cette journée par lots de 10k
    const BATCH_SIZE = 10000
    let allRows: any[] = []
    let from = 0
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase
        .from('observations_6mn')
        .select('*')
        .gte('timestamp', `${targetDate}T00:00:00Z`)
        .lt('timestamp', `${targetDate}T23:59:59Z`)
        .range(from, from + BATCH_SIZE - 1)
        .order('timestamp', { ascending: true })

      if (error) throw error
      if (data && data.length > 0) {
        allRows.push(...data)
        if (data.length < BATCH_SIZE) hasMore = false
        else from += BATCH_SIZE
      } else {
        hasMore = false
      }
      
      console.log(`   - Récupéré ${allRows.length} lignes...`)
      if (allRows.length > 600000) {
          console.warn("⚠️ Trop de données ! Interruption pour éviter crash mémoire.")
          break;
      }
    }

    if (allRows.length === 0) {
      return new Response(JSON.stringify({ message: "Aucune donnée à archiver pour cette date" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 3. Encoder en JSON et uploader dans le Storage
    const year = targetDate.split('-')[0]
    const month = targetDate.split('-')[1]
    const day = targetDate.split('-')[2]
    const filePath = `6mn/${year}/${month}/${day}.json`

    console.log(`🚀 Upload vers Storage: ${filePath}`)
    
    // On convertit en texte JSON
    const jsonContent = JSON.stringify(allRows)
    
    const { error: uploadError } = await supabase.storage
      .from('observations-archives')
      .upload(filePath, jsonContent, {
        contentType: 'application/json',
        upsert: true
      })

    if (uploadError) {
      console.error("❌ Erreur Upload:", uploadError)
      throw uploadError
    }

    // 4. Suppression des données de la DB (optionnel mais recommandé pour nettoyer)
    console.log(`🗑️ Suppression des lignes en DB...`)
    const { error: deleteError } = await supabase
      .from('observations_6mn')
      .delete()
      .gte('timestamp', `${targetDate}T00:00:00Z`)
      .lt('timestamp', `${targetDate}T23:59:59Z`)

    if (deleteError) {
      console.error("⚠️ Erreur lors de la suppression (le fichier est quand même sauvegardé):", deleteError)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      date: targetDate, 
      rows: allRows.length, 
      path: filePath 
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('❌ FATAL:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
