import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZGV2YWVtdHdienhrc2psaGpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc2NTA2OCwiZXhwIjoyMDg0MzQxMDY4fQ.RC_D6wljCTi1WEf0aG3QoEf1ZH_sJkP9TiVXXAovMzI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncLightning24h() {
    console.log(`\n⚡ SYNCHRONISATION FOUDRE - Dernières 24 heures (Météo-NPDC)\n`);

    try {
        const response = await fetch('https://meteo-npdc.fr/api/v2/lightning/get_latest?minutes=1440');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const json = await response.json();
        if (!json.success || !Array.isArray(json.data)) {
            throw new Error('Format de réponse JSON inattendu');
        }

        const strikes = json.data;
        if (strikes.length === 0) {
            console.log(`⚫ 0 impacts détectés sur la France/Europe de l'Ouest lors des dernières 24h.`);
            return;
        }

        console.log(`📡 Reçu ${strikes.length} impacts en direct. Préparation de l'import Supabase...`);

        // Traduire le format d'impacts pour Supabase
        const strikesToInsert = strikes.map(s => {
            const dateObj = new Date(s.unix_timestamp * 1000);
            return {
                strike_time: dateObj.toISOString(),
                lat: parseFloat(s.latitude),
                lon: parseFloat(s.longitude)
            };
        });

        // Effectuer l'upsert pour insérer sans générer de doublons
        const { error } = await supabase
            .from('lightning_strikes')
            .upsert(strikesToInsert, { onConflict: 'strike_time,lat,lon', ignoreDuplicates: true });

        if (error) {
            console.log(`❌ Erreur d'enregistrement Supabase : ${error.message}`);
        } else {
            console.log(`✅ ${strikesToInsert.length.toString()} impacts insérés/upsertés avec succès dans Supabase.`);
        }

    } catch (e) {
        console.log(`❌ Échec de la synchronisation : ${e.message}`);
    }
}

syncLightning24h();
