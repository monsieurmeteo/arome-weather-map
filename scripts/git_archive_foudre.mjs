import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARCHIVES_DIR = path.join(__dirname, '..', 'public', 'archives_orage');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('❌ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ponytail: on garde 7 jours de foudre dans Supabase (très rapide), le reste part en archives Git.
const RETENTION_DAYS = 7; 

async function archiveDay(dateStr) {
    const formattedDateForFile = dateStr.replace(/-/g, '');
    const jsonPath = path.join(ARCHIVES_DIR, `orage_${formattedDateForFile}.json`);

    console.log(`📦 Extraction de la foudre pour le ${dateStr}...`);
    
    // Fetch all strikes for this day from Supabase
    let allStrikes = [];
    let from = 0;
    const LIMIT = 5000;
    
    while (true) {
        const { data, error } = await supabase
            .from('lightning_strikes')
            .select('strike_time, lat, lon')
            .gte('strike_time', `${dateStr}T00:00:00Z`)
            .lte('strike_time', `${dateStr}T23:59:59Z`)
            .range(from, from + LIMIT - 1)
            .order('strike_time', { ascending: true });

        if (error) {
            console.error(`❌ Erreur Supabase pour le ${dateStr}:`, error.message);
            return false;
        }

        if (!data || data.length === 0) break;
        allStrikes.push(...data);
        if (data.length < LIMIT) break;
        from += LIMIT;
    }

    if (allStrikes.length === 0) {
        console.log(`⚫ Aucun impact pour le ${dateStr}, fichier d'archive vide.`);
        // Créer un fichier vide [] pour éviter les requêtes infinies de l'appli
        fs.writeFileSync(jsonPath, JSON.stringify([], null, 2));
    } else {
        // Formatage pour coller exactement à l'ancien format Agate attendu par OrageArchives.jsx
        const formattedData = allStrikes.map(s => {
            const d = new Date(s.strike_time);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const min = String(d.getMinutes()).padStart(2, '0');
            
            return {
                date: `${yyyy}/${mm}/${dd}`,
                heure: `${hh}:${min}`,
                lon: parseFloat(s.lon).toFixed(6),
                lat: parseFloat(s.lat).toFixed(6),
                DateTime: null
            };
        });

        if (!fs.existsSync(ARCHIVES_DIR)) {
            fs.mkdirSync(ARCHIVES_DIR, { recursive: true });
        }

        fs.writeFileSync(jsonPath, JSON.stringify(formattedData, null, 2));
        console.log(`💾 Écrit ${formattedData.length} impacts dans ${jsonPath}`);
    }

    // Supprimer les lignes de Supabase une fois archivées localement
    const { error: delError } = await supabase
        .from('lightning_strikes')
        .delete()
        .gte('strike_time', `${dateStr}T00:00:00Z`)
        .lte('strike_time', `${dateStr}T23:59:59Z`);

    if (delError) {
        console.error(`❌ Erreur suppression Supabase pour ${dateStr}:`, delError.message);
        return false;
    }

    console.log(`🗑️  Données nettoyées de Supabase pour le ${dateStr}.`);
    return true;
}

async function runArchiving() {
    console.log("⚡ DÉBUT DE L'ARCHIVAGE FOUDRE VERS GIT...");

    // Trouver les dates uniques plus vieilles que RETENTION_DAYS
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    console.log(`🔍 Recherche de dates antérieures au ${cutoffStr}...`);

    // Sélectionner les dates uniques de la table lightning_strikes
    const { data: bounds, error: boundsError } = await supabase
        .from('lightning_strikes')
        .select('strike_time')
        .order('strike_time', { ascending: true })
        .limit(1);

    if (boundsError) {
        console.error("❌ Impossible de récupérer les bornes temporelles:", boundsError.message);
        return;
    }

    if (!bounds || bounds.length === 0) {
        console.log("⚫ Aucun impact présent en base à archiver.");
        return;
    }

    const oldestDate = new Date(bounds[0].strike_time);
    let current = new Date(oldestDate.toISOString().split('T')[0]);

    // Boucler jour par jour du plus vieux jusqu'au cutoff
    while (current < cutoffDate) {
        const dateStr = current.toISOString().split('T')[0];
        await archiveDay(dateStr);
        current.setDate(current.getDate() + 1);
    }

    console.log("✨ Fin du processus d'archivage.");
}

runArchiving();
