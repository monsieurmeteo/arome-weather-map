// Service pour récupérer les noms des communes à partir du code INSEE
// Utilise l'API Geo Gouv et notre base de données Supabase
import { supabase } from './supabaseClient';

const cache = new Map();

export const geoService = {
    /**
     * Récupère le nom d'une commune par son code INSEE
     * @param {string} codeInsee
     * @returns {Promise<string>}
     */
    getCommuneName: async (codeInsee, stationId = null) => {
        if (!codeInsee && !stationId) return 'Station inconnue';

        // 1. Priorité absolue : Rechercher dans notre table 'stations' via Supabase si on a le stationId
        if (stationId) {
            try {
                const { data, error } = await supabase
                    .from('stations')
                    .select('name')
                    .eq('id', stationId)
                    .single();

                if (data && data.name) {
                    return data.name;
                }
            } catch (err) {
                console.warn('Erreur lookup station table:', err);
            }
        }

        let targetCode = codeInsee;

        // CORSE SPECIAL CASE: Map 20xxx to 2Axxx or 2Bxxx
        if (codeInsee && codeInsee.startsWith('20')) {
            const numPart = parseInt(codeInsee.substring(2, 5), 10);
            if (numPart < 200) {
                targetCode = '2A' + codeInsee.substring(2);
            } else {
                targetCode = '2B' + codeInsee.substring(2);
            }
        }

        // Vérifier le cache
        const cacheKey = stationId || targetCode;
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        try {
            const response = await fetch(`https://geo.api.gouv.fr/communes/${targetCode}?fields=nom&format=json`);

            if (response.ok) {
                const data = await response.json();
                const name = data.nom || `Station ${stationId || codeInsee}`;
                cache.set(cacheKey, name);
                return name;
            }
        } catch (error) {
            console.error('Erreur Geo API:', error);
        }

        return `Station ${stationId || codeInsee}`;
    },

    /**
     * Récupère les noms pour une liste de stations
     * @param {Array} stations
     * @returns {Promise<Object>} Map of codeInsee -> nom
     */
    /**
     * Recherche une adresse/ville précise via l'API Adresse (Gouv)
     * Plus précis que searchCommune pour le placement GPS
     */
    searchAddress: async (query) => {
        try {
            const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
            if (res.ok) {
                const data = await res.json();
                return data.features || [];
            }
        } catch (e) {
            console.error("Address search error:", e);
        }
        return [];
    }
};
