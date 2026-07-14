import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const SUPABASE_URL = Deno.env.get('PROJECT_URL') || Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
    try {
        // 1. Calcul de la date du jour en heure française
        // On force le fuseau Europe/Paris pour être sûr même si le serveur est ailleurs
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('fr-FR', {
            timeZone: 'Europe/Paris',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const parts = formatter.formatToParts(now);
        const yyyy = parts.find(p => p.type === 'year')?.value;
        const mm = parts.find(p => p.type === 'month')?.value;
        const dd = parts.find(p => p.type === 'day')?.value;
        const dateStr = `${yyyy}${mm}${dd}`;

        // 2. Récupération des données chez Agate
        const agateUrl = `https://www.mwattest.fr/ORAGE/orage/ws/wsOragesGMaps.php?date=${dateStr}&heureD=00&heureF=23&pass=jh2kH3,R`;

        console.log(`Collecte foudre Agate pour le ${dateStr}...`);
        const response = await fetch(agateUrl);
        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Format de données Agate invalide");
        }

        console.log(`${data.length} impacts trouvés chez Agate.`);

        // 3. Préparation des données pour Supabase
        // On détermine l'offset actuel (Hiver +0100, Été +0200) pour la date donnée
        const MONITOR_LAT = 50.3707;
        const MONITOR_LON = 3.0818;
        const ALERT_RADIUS_KM = 10;
        let nearImpactCount = 0;

        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        const strikesToInsert = data.map(s => {
            const formattedDate = s.date.replace(/\//g, '-');
            const lat = parseFloat(s.lat);
            const lon = parseFloat(s.lon);

            // On vérifie la proximité
            const dist = calculateDistance(MONITOR_LAT, MONITOR_LON, lat, lon);
            if (dist <= ALERT_RADIUS_KM) nearImpactCount++;

            const timestamp = `${formattedDate}T${s.heure}+01:00`;
            return {
                strike_time: timestamp,
                lat: lat,
                lon: lon
            };
        });

        // 4. Notification dynamique par utilisateur (uniquement impacts récents < 10 min)
        const tenMinsAgo = new Date(now.getTime() - 10 * 60000);
        const { data: userConfigs } = await supabase.from('user_station_configs').select('*').eq('alert_foudre_enabled', true);

        if (userConfigs && userConfigs.length > 0) {
            for (const config of userConfigs) {
                let countForUser = 0;
                for (const strike of data) {
                    const [hh, mm] = strike.heure.split(':');
                    const strikeTime = new Date(now);
                    strikeTime.setHours(parseInt(hh), parseInt(mm), 0, 0);

                    if (strikeTime >= tenMinsAgo) {
                        const dist = calculateDistance(config.lat, config.lon, parseFloat(strike.lat), parseFloat(strike.lon));
                        if (dist <= (config.alert_foudre_radius || 10)) {
                            countForUser++;
                        }
                    }
                }

                if (countForUser > 0) {
                    console.log(`⚡ FOUDRE ! ${countForUser} impacts à ${config.city_name}`);
                    await fetch(`https://ntfy.sh/${config.ntfy_topic}`, {
                        method: 'POST',
                        body: `⚡ FOUDRE : ${countForUser} impact(s) détecté(s) à moins de ${config.alert_foudre_radius}km de ${config.city_name} !`,
                        headers: {
                            'Title': 'Surveillance Orageuse',
                            'Priority': 'high',
                            'Tags': 'zap,warning'
                        }
                    });
                }
            }
        }

        // 4. Insertion massive
        const CHUNK_SIZE = 1000;
        let insertedTotal = 0;

        for (let i = 0; i < strikesToInsert.length; i += CHUNK_SIZE) {
            const chunk = strikesToInsert.slice(i, i + CHUNK_SIZE);
            const { error, count } = await supabase
                .from('lightning_strikes')
                .upsert(chunk, {
                    onConflict: 'strike_time,lat,lon',
                    ignoreDuplicates: true
                });

            if (error) console.error("Erreur d'insertion chunk:", error.message);
            else insertedTotal += chunk.length;
        }

        return new Response(JSON.stringify({
            success: true,
            total_agate: data.length,
            message: `Synchronisation réussie (${insertedTotal} impacts traités)`
        }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Erreur robot foudre:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
