import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
if (fs.existsSync('.env.local')) dotenv.config({ path: '.env.local' });
else dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: latest, error: err1 } = await supabase
        .from('observations_6mn')
        .select('timestamp, t')
        .eq('station_id', '35281001')
        .order('timestamp', { ascending: false })
        .limit(5);

    if (err1) console.error(err1);
    let out = "--- Dernières observations pour Rennes ---\n";
    out += JSON.stringify(latest, null, 2) + "\n\n";
    out += `Nombre de relevés aujourd'hui (depuis 00h) : ${count}\n`;

    // Comparaison avec Lille (59343001)
    const { count: countLille } = await supabase
        .from('observations_6mn')
        .select('*', { count: 'exact', head: true })
        .eq('station_id', '59343001')
        .gte('timestamp', today.toISOString());

    out += `Nombre de relevés aujourd'hui pour Lille : ${countLille}\n`;
    fs.writeFileSync('test-output.txt', out);
}

check();
