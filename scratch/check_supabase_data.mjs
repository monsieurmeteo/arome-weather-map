import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
    console.log('Checking Supabase data...')
    
    // Check observations
    const { data: obs, error: obsError } = await supabase
        .from('observations')
        .select('*')
        .order('date_obs', { ascending: false })
        .limit(5)

    if (obsError) {
        console.error('Error fetching observations:', obsError)
    } else {
        console.log('Last 5 observations:')
        console.table(obs)
    }

    // Check count
    const { count, error: countError } = await supabase
        .from('observations')
        .select('*', { count: 'exact', head: true })

    if (countError) {
        console.error('Error fetching count:', countError)
    } else {
        console.log('Total observations count:', count)
    }

    // Check secrets (for token)
    const { data: secrets, error: secretsError } = await supabase
        .from('secrets')
        .select('*')

    if (secretsError) {
        console.error('Error fetching secrets:', secretsError)
    } else {
        console.log('Secrets:')
        console.table(secrets)
    }
}

checkData()
