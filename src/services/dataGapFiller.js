import { fetchStationObservations } from './meteocielService';
import { supabase } from './supabaseClient';

/**
 * Service pour identifier et combler les manques de données
 * en utilisant Meteociel comme source secondaire.
 */
export const dataGapFiller = {
    /**
     * Identifie les trous dans les données de 6 minutes et tente de les combler via Meteociel.
     * @param {string} stationId ID INSEE de la station (ex: Douai = 59178001)
     * @param {string|Date} date Date pour laquelle chercher les manques
     */
    fill6mnGaps: async (stationId, date) => {
        try {
            const dateObj = new Date(date);
            const startOfDay = new Date(dateObj);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(dateObj);
            endOfDay.setHours(23, 54, 0, 0); // Dernier point à 23h54

            console.log(`[GapFiller] 🔍 Recherche de trous pour ${stationId} le ${startOfDay.toLocaleDateString()}...`);

            // 1. Récupérer les données existantes de Supabase
            // On utilise une plage un peu plus large pour être sûr
            const rangeStart = new Date(startOfDay);
            rangeStart.setMinutes(-10);
            const rangeEnd = new Date(endOfDay);
            rangeEnd.setMinutes(10);

            const { data: existingData, error: fetchError } = await supabase
                .from('observations_6mn')
                .select('timestamp')
                .eq('station_id', stationId)
                .gte('timestamp', rangeStart.toISOString())
                .lte('timestamp', rangeEnd.toISOString());

            if (fetchError) throw fetchError;

            // Indexer les timestamps existants (normalisés aux 6 minutes)
            const existingTimestamps = new Set(existingData.map(d => {
                const dt = new Date(d.timestamp);
                dt.setSeconds(0, 0);
                return dt.toISOString();
            }));

            // 2. Générer tous les timestamps attendus (tous les 6 min)
            const expectedTimestamps = [];
            let current = new Date(startOfDay);
            while (current <= endOfDay) {
                expectedTimestamps.push(current.toISOString());
                current.setMinutes(current.getMinutes() + 6);
            }

            // Identifier les trous
            const missingTimestamps = expectedTimestamps.filter(ts => !existingTimestamps.has(ts));

            if (missingTimestamps.length === 0) {
                console.log(`[GapFiller] ✅ Aucun manque détecté pour ${stationId}.`);
                return { filled: 0, totalMissing: 0 };
            }

            console.log(`[GapFiller] ⚠️ ${missingTimestamps.length} points manquants détectés.`);

            // 3. Récupérer les données de Meteociel (intra-horaire)
            const meteocielData = await fetchStationObservations(stationId, date, true);
            if (!meteocielData || !meteocielData.observations || meteocielData.observations.length === 0) {
                console.warn(`[GapFiller] ❌ Pas de données Meteociel disponibles.`);
                return { filled: 0, totalMissing: missingTimestamps.length };
            }

            // 4. Mapper les données Meteociel aux timestamps ISO
            // Meteociel affiche l'heure locale. On doit reconstruire l'objet Date avec le fuseau horaire local.
            const meteocielMap = new Map();
            meteocielData.observations.forEach(obs => {
                // Créer une date locale (Meteociel est en heure française)
                // On utilise le jour de la date passée en paramètre
                const d = new Date(dateObj);
                const localObsDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), obs.hour, obs.minute, 0, 0);

                // Normaliser aux 6 minutes car Meteociel a parfois 1 min de décalage (ex: 23h55 au lieu de 23h54)
                const rounded = new Date(localObsDate);
                const mins = rounded.getMinutes();
                const roundedMins = Math.round(mins / 6) * 6;
                if (roundedMins === 60) {
                    rounded.setHours(rounded.getHours() + 1);
                    rounded.setMinutes(0);
                } else {
                    rounded.setMinutes(roundedMins);
                }

                meteocielMap.set(rounded.toISOString(), obs);
            });

            // 5. Préparer les lignes pour l'upsert
            const rowsToInsert = missingTimestamps.map(ts => {
                const obs = meteocielMap.get(ts);
                if (!obs) return null;

                // On ne comble que si on a au moins la température
                if (obs.t === null) return null;

                return {
                    station_id: stationId,
                    timestamp: ts,
                    t: obs.t,
                    u: obs.u,
                    td: obs.td,
                    ff: obs.ff, // Déjà en km/h sur Meteociel
                    fxi: obs.fxi,
                    pres: obs.pres,
                    rr_per: obs.rr,
                    _source: 'gapfiller_meteociel'
                };
            }).filter(row => row !== null);

            if (rowsToInsert.length === 0) {
                console.warn(`[GapFiller] ❌ Les données Meteociel ne couvrent pas les trous identifiés.`);
                return { filled: 0, totalMissing: missingTimestamps.length };
            }

            // 6. Upsert dans Supabase
            const { error: upsertError } = await supabase
                .from('observations_6mn')
                .upsert(rowsToInsert, { onConflict: 'station_id, timestamp', ignoreDuplicates: true });

            if (upsertError) throw upsertError;

            console.log(`[GapFiller] 🚀 ${rowsToInsert.length} points comblés avec succès !`);
            return { filled: rowsToInsert.length, totalMissing: missingTimestamps.length };

        } catch (err) {
            console.error(`[GapFiller] Erreur:`, err);
            return { error: err.message };
        }
    }
};
