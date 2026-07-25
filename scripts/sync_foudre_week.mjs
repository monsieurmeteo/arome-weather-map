import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ubdevaemtwbzxksjlhjg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZGV2YWVtdHdienhrc2psaGpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc2NTA2OCwiZXhwIjoyMDg0MzQxMDY4fQ.RC_D6wljCTi1WEf0aG3QoEf1ZH_sJkP9TiVXXAovMzI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const CHUNK = 500; // max safe pour Supabase upsert

async function upsertChunked(rows) {
    let inserted = 0;
    for (let i = 0; i < rows.length; i += CHUNK) {
        const chunk = rows.slice(i, i + CHUNK);
        const { error } = await supabase
            .from('lightning_strikes')
            .upsert(chunk, { onConflict: 'strike_time,lat,lon', ignoreDuplicates: true });
        if (error) {
            console.log(`❌ Chunk ${i}-${i+CHUNK} : ${error.message}`);
        } else {
            inserted += chunk.length;
            process.stdout.write(`\r  → ${inserted}/${rows.length} insérés...`);
        }
    }
    console.log('');
    return inserted;
}

async function syncLightning24h() {
    // ponytail: 90min en cron horaire (overlap 30min), 1440min en manuel pour backfill
    const MINUTES = process.env.CRON_MODE === '1' ? 90 : 1440;
    console.log(`\n⚡ SYNCHRONISATION FOUDRE - Fenêtre ${MINUTES} min (Météo-NPDC)\n`);
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

        // ponytail: bbox France métro uniquement — Blitzortung couvre toute l'Europe
        const rows = strikes
            .filter(s => {
                const lat = parseFloat(s.latitude), lon = parseFloat(s.longitude);
                return lat >= 41 && lat <= 52 && lon >= -5.5 && lon <= 10;
            })
            .map(s => ({
                strike_time: new Date(s.unix_timestamp * 1000).toISOString(),
                lat: parseFloat(s.latitude),
                lon: parseFloat(s.longitude)
            }));

        console.log(`🗺️  ${rows.length} impacts dans bbox France. Upsert Supabase par chunks de ${CHUNK}...`);
        const inserted = await upsertChunked(rows);
        console.log(`✅ ${inserted} impacts archivés.`);

    } catch (e) {
        console.log(`❌ ${e.message}`);
    }
}

syncLightning24h();
