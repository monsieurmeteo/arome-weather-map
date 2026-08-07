import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    // Créer la fonction SQL get_fire_risk_data via migration directe
    const { data, error } = await sb.from('daily_summaries')
        .select('station_id,temp_max,wind_mean_max')
        .eq('date', new Date().toISOString().split('T')[0])
        .not('temp_max', 'is', null)
        .limit(5);
    
    console.log('Sample daily_summaries:', JSON.stringify(data));
    
    // Vérifier le min d'humidité pour ces stations
    const today = new Date().toISOString().split('T')[0];
    const stIds = data?.map(d => d.station_id) || [];
    
    const { data: humData } = await sb.from('observations_6mn')
        .select('station_id,u')
        .gte('timestamp', today + 'T00:00:00Z')
        .in('station_id', stIds)
        .not('u', 'is', null);
    
    // Grouper par station
    const humByStation = {};
    humData?.forEach(o => {
        if (!humByStation[o.station_id] || o.u < humByStation[o.station_id]) {
            humByStation[o.station_id] = o.u;
        }
    });
    console.log('Min humidité par station:', JSON.stringify(humByStation));
    
    // Compter les stations avec temp_max >= 25 aujourd'hui (risque potentiel)
    const { count } = await sb.from('daily_summaries')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .gte('temp_max', 25);
    console.log('Stations avec temp_max >= 25 aujourd\'hui:', count);
    
    const { count: count30 } = await sb.from('daily_summaries')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .gte('temp_max', 30);
    console.log('Stations avec temp_max >= 30 aujourd\'hui:', count30);
}

main().catch(console.error);
