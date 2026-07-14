import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://ubdevaemtwbzxksjlhjg.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZGV2YWVtdHdienhrc2psaGpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc2NTA2OCwiZXhwIjoyMDg0MzQxMDY4fQ.RC_D6wljCTi1WEf0aG3QoEf1ZH_sJkP9TiVXXAovMzI'
);

async function syncLastDays(days = 7) {
    console.log(`\n⚡ SYNCHRONISATION FOUDRE - ${days} derniers jours\n`);

    let totalSynced = 0;

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}${mm}${dd}`;
        const displayDate = `${dd}/${mm}/${yyyy}`;

        try {
            const agateUrl = `https://www.mwattest.fr/ORAGE/orage/ws/wsOragesGMaps.php?date=${dateStr}&heureD=00&heureF=23&pass=jh2kH3,R`;

            const response = await fetch(agateUrl);
            const data = await response.json();

            if (!Array.isArray(data)) {
                console.log(`${displayDate}: ❌ Format invalide`);
                continue;
            }

            if (data.length === 0) {
                console.log(`${displayDate}: ⚫ 0 impacts (aucune activité)`);
                continue;
            }

            const strikesToInsert = data.map(s => {
                const formattedDate = s.date.replace(/\//g, '-');
                const timestamp = `${formattedDate}T${s.heure}+01:00`;
                return {
                    strike_time: timestamp,
                    lat: parseFloat(s.lat),
                    lon: parseFloat(s.lon)
                };
            });

            const { error } = await supabase
                .from('lightning_strikes')
                .upsert(strikesToInsert, { onConflict: 'strike_time,lat,lon', ignoreDuplicates: true });

            if (error) {
                console.log(`${displayDate}: ❌ Erreur Supabase - ${error.message}`);
            } else {
                console.log(`${displayDate}: ✅ ${data.length.toString().padStart(5)} impacts synchronisés`);
                totalSynced += data.length;
            }

        } catch (e) {
            console.log(`${displayDate}: ❌ Erreur - ${e.message}`);
        }
    }

    console.log(`\n📊 TOTAL: ${totalSynced.toLocaleString()} impacts synchronisés vers Supabase\n`);
}

syncLastDays(7);
