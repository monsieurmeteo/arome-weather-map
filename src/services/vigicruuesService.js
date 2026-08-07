/**
 * Service pour l'API Vigicrues (Vigilance) et HubEau (Données Hydrométriques)
 */

const VIGICRUES_BASE = 'https://www.vigicrues.gouv.fr/services';
const HUBEAU_API = 'https://hubeau.eaufrance.fr/api/v1/hydrometrie';
// GeoJSON Départements France Simplifié (Source github gregoiredavid/france-geojson)
const DEPARTEMENTS_GEOJSON_URL = '/data/departements-version-simplifiee.geojson';


// Mapping complet et "forcé" pour garantir des noms lisibles
const REGION_NAMES = {
    // Districts Européens
    'EU31': 'Rhin-Meuse',
    'EU32': 'Artois-Picardie',
    'EU33': 'Seine-Normandie',
    'EU34': 'Loire-Bretagne',
    'EU35': 'Adour-Garonne',
    'EU36': 'Rhône-Méditerranée',
    'EU3': 'Seine-Normandie', // Cas code tronqué observé

    // Codes SPC "Métier" (souvent utilisés en interne)
    'SPC': 'Service Prévision Crues',
    'MS': 'Meuse-Moselle',
    'FRL': 'Loire-Cher-Indre', // Attention: FRL code souvent ambigu (parfois DOM, parfois Loire), ici contexte probable métropole
    'LB': 'Loire-Bretagne',
    'PL': 'Pays de la Loire',
    'AG': 'Adour-Garonne',
    'RM': 'Rhône-Méditerranée',
    'SN': 'Seine-Normandie',
    'AP': 'Artois-Picardie',
    'SM': 'Seine-Moyenne-Yonne-Loing',
    'OISE': 'Oise-Aisne',
    'GIRONDE': 'Gironde-Adour-Dordogne',
    'ALPES': 'Alpes du Nord',
    'MED': 'Méditerranée Est',
    'GRAND_DELTA': 'Grand Delta',
    'RHONE': 'Rhône amont-Saône',

    // DOM-TOM (Codes ISO ou internes)
    'FRA': 'Escaut',
    'FRB': 'Meuse-Moselle',
    'FRB1': 'Meuse',
    'FRB2': 'Moselle',
    'FRC': 'Rhône-Méditerranée',
    'FRD': 'Rhin-Meuse',
    'FRE': 'Loire-Bretagne',
    'FRF': 'Artois-Picardie',
    'FRG': 'Seine-Normandie',
    'FRH': 'Adour-Garonne',
    'FRI': 'Sambre',
    'FRJ': 'Corse',
    'FRK': 'Guadeloupe',
    'FRM': 'Guyane',
    'FRN': 'Réunion',
    'FRO': 'Mayotte',
    'FRP': 'Martinique'
};

// --- VIGICRUES (Vigilance & Structure) ---

export async function fetchTronçonsGeoJSON() {
    try {
        const response = await fetch(`${VIGICRUES_BASE}/1/InfoVigiCru.geojson`);
        if (!response.ok) throw new Error('Failed to fetch GeoJSON');
        return await response.json();
    } catch (error) {
        console.error('Error fetching tronçons GeoJSON:', error);
        throw error;
    }
}

export async function fetchDepartementsGeoJSON() {
    try {
        const response = await fetch(DEPARTEMENTS_GEOJSON_URL);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error fetching departements:', error);
        return null;
    }
}

export async function fetchTronçonDetail(codeEntVigiCru, codeTerritoire = null) {
    try {
        let detail = null;
        const response = await fetch(`${VIGICRUES_BASE}/v1.1/TronEntVigiCru.json?CdEntVigiCru=${codeEntVigiCru}&TypEntVigiCru=8`);

        if (response.ok) {
            const data = await response.json();
            detail = data.TronEntVigiCru?.[0] || data.ListEntVigiCru?.[0] || null;
        }

        if ((!detail || !detail.ComEntVigiCru) && codeTerritoire) {
            try {
                const terRes = await fetch(`${VIGICRUES_BASE}/v1.1/TerEntVigiCru.json?CdEntVigiCru=${codeTerritoire}`);
                if (terRes.ok) {
                    const terData = await terRes.json();
                    const terDetail = terData.TerEntVigiCru?.[0];
                    if (terDetail?.ComEntVigiCru) {
                        if (!detail) detail = {};
                        detail.ComEntVigiCru = terDetail.ComEntVigiCru;
                        detail.IsTerritoireBulletin = true;
                        detail.TerritoireNom = terDetail.LbEntVigiCru;
                    }
                }
            } catch (err) { console.warn('Erreur fallback territoire:', err); }
        }
        return detail;
    } catch (error) {
        return null;
    }
}

export async function fetchStationsForTroncon(codeTroncon) {
    try {
        const response = await fetch(`${VIGICRUES_BASE}/v1.1/TronEntVigiCru.json?CdEntVigiCru=${codeTroncon}&TypEntVigiCru=8`);
        if (!response.ok) return [];
        const data = await response.json();
        const items = data.TronEntVigiCru || data.ListEntVigiCru || [];

        // On retourne tout ce qui ressemble à une station
        return items.map(i => ({
            code: i.CdEntVigiCruInferieur,
            nom: i.LbEntVigiCruInferieur,
            type: i.TypEntVigiCruInferieur
        }));
    } catch (error) {
        return [];
    }
}

export async function fetchTerritoires() {
    try {
        const response = await fetch(`${VIGICRUES_BASE}/v1.1/TerEntVigiCru.json`);
        if (!response.ok) throw new Error('Failed to fetch territoires');
        const data = await response.json();
        return data.TerEntVigiCru || [];
    } catch (error) { return []; }
}

// --- HUBEAU (Données Temps Réel) ---

export async function fetchStationObservations(stationCode) {
    try {
        const url = `${HUBEAU_API}/observations_tr?code_entite=${stationCode}&size=500&sort=desc&pretty`;
        const response = await fetch(url);

        if (!response.ok) return null;
        const json = await response.json();

        if (!json.data || json.data.length === 0) return null;

        const obs = json.data.map(d => ([
            new Date(d.date_obs).getTime(),
            d.resultat_obs
        ])).reverse();

        const grandeur = json.data[0].grandeur_hydro;

        return {
            Serie: {
                ObssHydro: obs,
                GrdSerie: grandeur
            },
            Source: "HubEau"
        };
    } catch (error) {
        console.error(`Erreur HubEau pour ${stationCode}:`, error);
        return null;
    }
}

export function calculateVigilanceStats(geoJSON) {
    if (!geoJSON?.features) return { vert: 0, jaune: 0, orange: 0, rouge: 0 };
    const stats = { vert: 0, jaune: 0, orange: 0, rouge: 0 };
    geoJSON.features.forEach(feature => {
        const niveau = feature.properties?.NivInfViCr || 1;
        switch (niveau) {
            case 1: stats.vert++; break;
            case 2: stats.jaune++; break;
            case 3: stats.orange++; break;
            case 4: stats.rouge++; break;
        }
    });
    return stats;
}

export async function groupTronconsByTerritory(geoJSON) {
    if (!geoJSON?.features) return {};
    let territoryMap = {};
    try {
        const territoires = await fetchTerritoires();
        territoires.forEach(t => { territoryMap[t.CdEntVigiCru] = t.LbEntVigiCru; });
    } catch (e) { }

    const grouped = {};
    geoJSON.features.forEach(feature => {
        const props = feature.properties;
        const regionCode = props.cddient_1 || props.cdensup_1 || 'Autre';

        // Résolution du nom : Territoire API > Mapping Statique > Code brut
        let regionName = territoryMap[regionCode] || REGION_NAMES[regionCode] || regionCode;

        // Nettoyage intelligent
        if (typeof regionName === 'string') {
            if (regionName.startsWith('SPC ')) regionName = regionName.substring(4);
            if (regionName.length <= 4) {
                const partialMatch = Object.keys(REGION_NAMES).find(k => regionName.startsWith(k));
                if (partialMatch) regionName = REGION_NAMES[partialMatch];
            }
        }

        if (!grouped[regionName]) grouped[regionName] = { code: regionCode, troncons: [], stats: { vert: 0, jaune: 0, orange: 0, rouge: 0 } };

        const niveau = props.NivInfViCr || 1;
        grouped[regionName].troncons.push({
            code: props.CdEntCru,
            nom: props.lbentcru,
            vigilance: niveau
        });

        if (niveau === 1) grouped[regionName].stats.vert++;
        else if (niveau === 2) grouped[regionName].stats.jaune++;
        else if (niveau === 3) grouped[regionName].stats.orange++;
        else if (niveau === 4) grouped[regionName].stats.rouge++;
    });

    // Sort
    const sorted = {};
    Object.keys(grouped).sort().forEach(k => sorted[k] = grouped[k]);
    return sorted;
}

export function getTronçonsEnVigilance(geoJSON) {
    if (!geoJSON?.features) return [];
    return geoJSON.features
        .filter(f => f.properties?.NivInfViCr > 1)
        .map(f => ({
            code: f.properties.CdEntCru,
            nom: f.properties.lbentcru,
            vigilance: f.properties.NivInfViCr,
            region: f.properties.cddient_1
        }))
        .sort((a, b) => b.vigilance - a.vigilance);
}
