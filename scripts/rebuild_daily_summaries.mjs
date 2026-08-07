import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function rebuildHistory() {
    console.log("🛠️ DÉBUT DE LA RECONSTRUCTION DES RÉSUMÉS MENSUELS/HISTORIQUES");
    
    // Pour les 30 derniers jours (sauf aujourd'hui)
    for (let i = 1; i <= 30; i++) {
        const dObj = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const targetDate = dObj.toISOString().split('T')[0];
        const [y, m, d] = targetDate.split('-');
        const filePath = `6mn/${y}/${m}/${d}.json`;

        console.log(`\n📅 Reconstruction pour le ${targetDate}...`);

        try {
            // 1. Lire depuis le stockage (Archive)
            const { data: fileData, error: downloadError } = await supabase.storage
                .from('observations-archives')
                .download(filePath);
            
            if (downloadError) {
                console.log(`   ⏩ Aucune archive trouvée pour cette date (Peut-être déjà en SQL). On passe.`);
                continue;
            }

            const text = await fileData.text();
            const allRows = JSON.parse(text);

            if (allRows.length === 0) continue;

            // 2. Calculer les résumés
            const stationMap = new Map();
            for (const row of allRows) {
                const sid = row.station_id;
                if (!stationMap.has(sid)) {
                    stationMap.set(sid, {
                        station_id: sid,
                        date: targetDate,
                        temp_min: 999,
                        temp_max: -999,
                        wind_gust_max: -1,
                        wind_gust_time: null,
                        rain_total: 0
                    });
                }
                const st = stationMap.get(sid);
                if (row.t !== null && row.t < st.temp_min) st.temp_min = row.t;
                if (row.t !== null && row.t > st.temp_max) st.temp_max = row.t;
                if (row.fxi !== null && row.fxi > st.wind_gust_max) {
                    st.wind_gust_max = row.fxi;
                    st.wind_gust_time = row.timestamp;
                }
                if (row.rr_per !== null && row.rr_per > 0) st.rain_total += row.rr_per;
            }

            // 3. Format et Envoi vers Supabase
            const upserts = Array.from(stationMap.values()).map(s => {
                if (s.temp_min === 999) s.temp_min = null;
                if (s.temp_max === -999) s.temp_max = null;
                if (s.wind_gust_max === -1) s.wind_gust_max = null;
                s.updated_at = new Date().toISOString();
                return s;
            });

            console.log(`   🚀 Envoi de ${upserts.length} résumés de stations pour le ${targetDate}...`);
            const BATCH = 2000;
            for(let j=0; j<upserts.length; j+=BATCH) {
                const chunk = upserts.slice(j, j+BATCH);
                const { error: upsertError } = await supabase
                    .from('daily_summaries')
                    .upsert(chunk, { onConflict: 'station_id, date' });
                if (upsertError) console.error("   ❌ Erreur d'envoi", upsertError.message);
            }
            console.log(`   ✅ OK !`);

        } catch (e) {
            console.error(`   💥 Erreur inattendue : ${e.message}`);
        }
    }
    console.log("\n🎉 RECONSTRUCTION TERMINÉE ! Les cartes mensuelles seront justes.");
}

rebuildHistory();
