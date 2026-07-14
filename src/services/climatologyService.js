
/**
 * Service to fetch and parse official Météo-France climatological data (.data files)
 */

const BASE_URL = 'https://object.files.data.gouv.fr/meteofrance/data/synchro_ftp/REF_STATION/';

export const climatologyService = {
    /**
     * Fetch the raw .data content for a station
     */
    async fetchStationData(stationId) {
        // IDs must be 8 digits, padded with 0
        const id = stationId.toString().padStart(8, '0');
        const url = `${BASE_URL}FICHECLIM_${id}.data`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Status ${response.status}`);
            return await response.text();
        } catch (e) {
            console.error(`Failed to fetch climatology for ${stationId}`, e);
            return null;
        }
    },

    /**
     * Parse the semicolon-separated .data format
     */
    parseFiche(text) {
        if (!text) return null;

        const lines = text.split('\n').map(l => l.trim());
        const result = {
            metadata: {},
            normals: {},
            records: {},
            days: {}
        };

        // Extract station metadata
        for (let i = 0; i < 10; i++) {
            if (lines[i]?.includes('Indicatif')) {
                result.metadata.raw = lines[i];
                const matches = lines[i].match(/(.+) \((\d+)\)\s+Indicatif : (\d+), alt : (\d+)m, lat : ([^,]+), lon : (.+)/);
                if (matches) {
                    result.metadata.name = matches[1];
                    result.metadata.dept = matches[2];
                    result.metadata.id = matches[3];
                    result.metadata.alt = matches[4];
                    result.metadata.lat = matches[5];
                    result.metadata.lon = matches[6];
                }
            }
        }

        const parseValues = (line) => {
            if (!line) return [];
            return line.split(';')
                .slice(1) // skip the label column
                .map(v => {
                    const val = v.trim();
                    if (val === '.' || val === '-' || val === '') return null;
                    return parseFloat(val.replace(',', '.'));
                });
        };

        const parseDates = (line) => {
            if (!line) return [];
            return line.split(';')
                .slice(1)
                .map(v => v.trim() || null);
        };

        // Scan lines for specific data blocks
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // --- TEMPERATURES ---
            if (line.includes('La température la plus élevée')) {
                result.records.maxT = {
                    period: lines[i + 1]?.match(/\d{2}-\d{2}-\d{4}/g),
                    vals: parseValues(lines[i + 2]),
                    dates: parseDates(lines[i + 3])
                };
            }
            if (line.includes('Température maximale (Moyenne')) {
                result.normals.tx = parseValues(lines[i + 1]);
            }
            if (line.includes('Température moyenne (Moyenne')) {
                result.normals.tm = parseValues(lines[i + 1]);
            }
            if (line.includes('Température minimale (Moyenne')) {
                result.normals.tn = parseValues(lines[i + 1]);
            }
            if (line.includes('La température la plus basse')) {
                result.records.minT = {
                    period: lines[i + 1]?.match(/\d{2}-\d{2}-\d{4}/g),
                    vals: parseValues(lines[i + 2]),
                    dates: parseDates(lines[i + 3])
                };
            }

            // --- DAYS THRESHOLDS (TEMP) ---
            if (line.startsWith('Tx >=  30°C')) result.days.tx30 = parseValues(line);
            if (line.startsWith('Tx >=  25°C')) result.days.tx25 = parseValues(line);
            if (line.startsWith('Tx <=   0°C')) result.days.tx0 = parseValues(line);
            if (line.startsWith('Tn <=   0°C')) result.days.tn0 = parseValues(line);
            if (line.startsWith('Tn <=  -5°C')) result.days.tnMinus5 = parseValues(line);
            if (line.startsWith('Tn <= -10°C')) result.days.tnMinus10 = parseValues(line);

            // --- PRECIPITATIONS ---
            if (line.includes('Précipitations : Hauteur quotidienne maximale')) {
                result.records.maxRain = {
                    period: lines[i + 1]?.match(/\d{2}-\d{2}-\d{4}/g),
                    vals: parseValues(lines[i + 2]),
                    dates: parseDates(lines[i + 3])
                };
            }
            if (line.includes('Précipitations : Hauteur moyenne mensuelle')) {
                result.normals.pr = parseValues(lines[i + 1]);
            }
            if (line.startsWith('Rr >=  1 mm')) result.days.rain1 = parseValues(line);
            if (line.startsWith('Rr >=  5 mm')) result.days.rain5 = parseValues(line);
            if (line.startsWith('Rr >= 10 mm')) result.days.rain10 = parseValues(line);

            // --- SOLAR / ETP / DJU ---
            if (line.includes('Durée d\'insolation')) {
                if (!lines[i + 1]?.includes('non disponibles')) result.normals.sun = parseValues(lines[i + 1]);
            }
            if (line.includes('Rayonnement global')) {
                if (!lines[i + 1]?.includes('non disponibles')) result.normals.rad = parseValues(lines[i + 1]);
            }
            if (line.includes('Evapotranspiration Potentielle')) {
                if (!lines[i + 1]?.includes('non disponibles')) result.normals.etp = parseValues(lines[i + 1]);
            }
            if (line.includes('Degrés Jours Unifiés')) {
                result.normals.dju = parseValues(lines[i + 1]);
            }

            // --- WIND ---
            if (line.includes('Rafale maximale de vent')) {
                if (!lines[i + 2]?.includes('non disponibles')) {
                    const rawVals = parseValues(lines[i + 2]);
                    // Explicit unit detection from header
                    const headerLine = lines[i];
                    let isKmh = headerLine.includes('(km/h)');
                    let isMs = headerLine.includes('(m/s)');

                    if (!isKmh && !isMs) {
                        const maxVal = Math.max(...(rawVals.filter(v => v !== null)));
                        isKmh = maxVal > 100;
                    }

                    result.records.maxWind = {
                        period: lines[i + 1]?.match(/\d{2}-\d{2}-\d{4}/g),
                        vals: rawVals.map(v => v !== null ? (isKmh ? v : v * 3.6) : null),
                        dates: parseDates(lines[i + 3])
                    };
                }
            }
            if (line.includes('Vitesse du vent moyenné sur 10 mn')) {
                if (!lines[i + 1]?.includes('non disponibles')) {
                    const rawVals = parseValues(lines[i + 1]);
                    result.normals.wind = rawVals.map(v => v !== null ? v * 3.6 : null);
                }
            }
            if (line.includes('Nombre moyen de jours avec rafales')) {
                if (lines[i + 1]?.includes('>= 16 m/s')) result.days.wind16 = parseValues(lines[i + 1]);
                if (lines[i + 2]?.includes('>= 28 m/s')) result.days.wind28 = parseValues(lines[i + 2]);
            }

            // --- PHENOMENA ---
            if (line.includes('brouillard / orage / grêle / neige')) {
                if (lines[i + 1] && !lines[i + 1].includes('non disponibles')) {
                    if (lines[i + 1]?.startsWith('Brouillard')) result.days.fog = parseValues(lines[i + 1]);
                    if (lines[i + 2]?.startsWith('Orage')) result.days.storm = parseValues(lines[i + 2]);
                    if (lines[i + 3]?.startsWith('Grêle')) result.days.hail = parseValues(lines[i + 3]);
                    if (lines[i + 4]?.startsWith('Neige')) result.days.snow = parseValues(lines[i + 4]);
                }
            }
        }

        return result;
    }
};
