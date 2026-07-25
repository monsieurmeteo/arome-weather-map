import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARCHIVES_DIR = path.join(__dirname, '..', 'public', 'archives_orage');

// Assure que le dossier des archives existe
if (!fs.existsSync(ARCHIVES_DIR)) {
    fs.mkdirSync(ARCHIVES_DIR, { recursive: true });
}

async function syncLightningStatic() {
    const MINUTES = process.env.CRON_MODE === '1' ? 90 : 1440;
    console.log(`\n⚡ SYNCHRONISATION FOUDRE STATIQUE - Fenêtre ${MINUTES} min (Météo-NPDC)\n`);
    
    try {
        const response = await fetch(`https://meteo-npdc.fr/api/v2/lightning/get_latest?minutes=${MINUTES}`, {
            referrerPolicy: 'no-referrer'
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const json = await response.json();
        if (!json.success || !Array.isArray(json.data)) throw new Error('Format JSON inattendu');

        const strikes = json.data;
        if (strikes.length === 0) { console.log('⚫ 0 impacts.'); return; }

        console.log(`📡 ${strikes.length} impacts reçus. Filtrage bbox France...`);

        // Bbox France métropolitaine
        const filtered = strikes.filter(s => {
            const lat = parseFloat(s.latitude), lon = parseFloat(s.longitude);
            return lat >= 41 && lat <= 52 && lon >= -5.5 && lon <= 10;
        });

        console.log(`🗺️  ${filtered.length} impacts dans la bbox France.`);

        // Grouper par jour
        const grouped = {};
        filtered.forEach(s => {
            const d = new Date(s.unix_timestamp * 1000);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            
            const dateKey = `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD
            const fileKey = `${yyyy}${mm}${dd}`;   // YYYYMMDD
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = {
                    fileKey,
                    strikes: []
                };
            }
            
            const hh = String(d.getHours()).padStart(2, '0');
            const min = String(d.getMinutes()).padStart(2, '0');
            
            grouped[dateKey].strikes.push({
                date: `${yyyy}/${mm}/${dd}`,
                heure: `${hh}:${min}`,
                lon: parseFloat(s.longitude).toFixed(6),
                lat: parseFloat(s.latitude).toFixed(6),
                DateTime: null
            });
        });

        // Pour chaque jour, charger l'existant, fusionner, dédupliquer et sauvegarder
        for (const [dateStr, group] of Object.entries(grouped)) {
            const jsonPath = path.join(ARCHIVES_DIR, `orage_${group.fileKey}.json`);
            let existingStrikes = [];

            if (fs.existsSync(jsonPath)) {
                try {
                    const content = fs.readFileSync(jsonPath, 'utf8');
                    existingStrikes = JSON.parse(content);
                    if (!Array.isArray(existingStrikes)) existingStrikes = [];
                } catch (e) {
                    console.warn(`⚠️ Fichier corrompu ou illisible pour le ${dateStr}, réinitialisé.`);
                    existingStrikes = [];
                }
            }

            // Clé de hachage unique pour chaque impact pour éviter les doublons
            const buildKey = (s) => {
                const latRounded = parseFloat(s.lat).toFixed(4);
                const lonRounded = parseFloat(s.lon).toFixed(4);
                return `${s.heure}-${latRounded}-${lonRounded}`;
            };

            const existingKeys = new Set(existingStrikes.map(buildKey));
            let newCount = 0;

            group.strikes.forEach(s => {
                const k = buildKey(s);
                if (!existingKeys.has(k)) {
                    existingStrikes.push(s);
                    existingKeys.add(k);
                    newCount++;
                }
            });

            if (newCount > 0) {
                // Trier par heure croissante
                existingStrikes.sort((a, b) => {
                    if (a.heure !== b.heure) return a.heure.localeCompare(b.heure);
                    if (a.lat !== b.lat) return parseFloat(a.lat) - parseFloat(b.lat);
                    return parseFloat(a.lon) - parseFloat(b.lon);
                });

                fs.writeFileSync(jsonPath, JSON.stringify(existingStrikes, null, 2));
                console.log(`💾 ${dateStr} : +${newCount} nouveaux impacts ajoutés. Total: ${existingStrikes.length}`);
            } else {
                console.log(`⚫ ${dateStr} : Aucun nouvel impact à ajouter.`);
            }
        }
        console.log(`✅ Synchronisation statique terminée.`);
    } catch (e) {
        console.error(`❌ Erreur synchro statique: ${e.message}`);
    }
}

syncLightningStatic();
