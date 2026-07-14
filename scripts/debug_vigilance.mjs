import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function checkAvalanches() {
    const { data, error } = await supabase
        .from('vigilance_status')
        .select('*')
        .eq('period', 1); // Tomorrow

    if (error) {
        console.error(error);
        return;
    }

    const avalanchePhenomId = "8";
    const avalancheDeps = data.filter(d => {
        const risk = d.risks?.find(r => r.id === avalanchePhenomId);
        return risk && risk.level >= 2;
    });

    console.log(`\n🏔️ AVALANCHES STATUS (Today - Period 0):`);
    console.log(`Total entries: ${avalancheDeps.length}`);
    avalancheDeps.forEach(d => {
        console.log(`- Dept: ${d.dep_code}, Level: ${d.level}`);
    });

    const codes = avalancheDeps.map(d => d.dep_code);
    console.log(`\nCodes list: [${codes.join(', ')}]`);
}

checkAvalanches();
