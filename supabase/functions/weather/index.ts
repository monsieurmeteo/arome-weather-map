import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Hono } from "https://esm.sh/hono@3.1.8";
import { cors } from "https://esm.sh/hono@3.1.8/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import regionalCities from "../../regional_cities.json" assert { type: "json" };

// Setup Supabase Environment Variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const app = new Hono().basePath("/weather");

// Enable CORS
app.use("*", cors());

// Helper to round coordinates to 2 decimal places (approx. 1.1km grid for caching efficiency)
const roundCoord = (val: number): number => Math.round(val * 100) / 100;

// Mapping WMO codes to professional weather conditions in French (proprietary)
function getWeatherCondition(code: number): string {
  if (code === 0) return "Ensoleillé";
  if (code === 1 || code === 2) return "Éclaircies";
  if (code === 3) return "Nuageux";
  if (code === 45 || code === 48) return "Brouillard";
  if (code >= 51 && code <= 55) return "Pluie faible";
  if (code >= 61 && code <= 65) return "Pluie";
  if (code >= 71 && code <= 77) return "Neige";
  if (code >= 80 && code <= 82) return "Averses";
  if (code >= 85 && code <= 86) return "Averses de neige";
  if (code >= 95 && code <= 99) return "Orageux";
  return "Clair";
}

// Custom CNEWS Weather Pictogram Mapping (maps Open-Meteo WMO code to CNEWS P-code)
function getPictoCode(wmoCode: number): string {
  const map: Record<number, string> = {
    0: 'P1',  // Soleil
    1: 'P2',  // Peu nuageux
    2: 'P8',  // Nuageux
    3: 'P4',  // Très nuageux
    5: 'P6',  // Soleil voilé
    13: 'P6',
    45: 'brouillards',
    48: 'brouillards',
    51: 'P10', // Pluies faibles
    53: 'P10',
    55: 'P10',
    61: 'P10',
    63: 'P10',
    65: 'P11', // Fortes pluies
    71: 'P12', // Neige
    73: 'P12',
    75: 'P12',
    77: 'P12',
    80: 'P9',  // Averses
    81: 'P9',
    82: 'P9',
    85: 'P12', // Averses de neige
    86: 'P12',
    95: 'P10', // Orages
    96: 'P10',
    99: 'P10'
  };
  return map[wmoCode] || 'P1';
}

const API_METADATA_LEXIQUE = {
  description: "Lexique des paramètres météo retournés par l'API (unités et définitions)",
  parametres: {
    temp_actuelle: "Température actuelle sous abri en degrés Celsius (°C).",
    vent_actuel: "Vitesse moyenne du vent actuel à 10 mètres d'altitude (km/h).",
    pictogramme: "Code d'affichage du pictogramme météo CNEWS (ex: P1 = Soleil, P10 = Pluie).",
    condition_meteo: "Description textuelle claire des conditions météorologiques.",
    temp: "Température de l'air sous abri à 2m du sol (°C).",
    temp_max: "Température maximale prévue sur la journée (°C).",
    temp_min: "Température minimale prévue sur la journée (°C).",
    humidite: "Humidité relative de l'air (%).",
    point_de_rosee: "Température de point de rosée (°C).",
    temp_ressentie: "Température apparente (ressentie par le corps humain) en °C.",
    ressenti_max: "Température apparente maximale de la journée (°C).",
    ressenti_min: "Température apparente minimale de la journée (°C).",
    proba_precipitations: "Probabilité qu'il y ait des précipitations (%).",
    probabilite_pluie_max: "Probabilité maximale de pluie sur la journée (%).",
    precipitations: "Quantité totale de précipitations (mm).",
    pluie: "Quantité de pluie uniquement (mm).",
    pluie_cumul: "Cumul total de précipitations sur la journée (mm).",
    pluie_plaine: "Cumul de pluie (hors neige/averses) sur la journée (mm).",
    averses: "Quantité de pluie sous forme d'averses (mm).",
    averses_cumul: "Cumul d'averses sur la journée (mm).",
    neige: "Quantité de neige tombée (cm).",
    neige_cumul: "Cumul de chute de neige sur la journée (cm).",
    hauteur_neige: "Épaisseur de neige au sol (m).",
    code_meteo: "Code WMO (Organisation Météorologique Mondiale) des conditions météo.",
    pression_mer: "Pression atmosphérique au niveau de la mer (hPa).",
    pression_sol: "Pression atmosphérique au niveau du sol (hPa).",
    nebulosite_totale: "Couverture nuageuse totale (%).",
    nuages_bas: "Couverture nuageuse à basse altitude (%).",
    nuages_moyens: "Couverture nuageuse à moyenne altitude (%).",
    nuages_hauts: "Couverture nuageuse à haute altitude (%).",
    visibilite: "Distance de visibilité horizontale (m).",
    evapotranspiration: "Quantité d'eau évaporée (mm).",
    deficit_vapeur: "Déficit de pression de vapeur (kPa).",
    vent_vitesse: "Vitesse du vent à 10m du sol (km/h).",
    vent_vitesse_max: "Vitesse maximale moyenne du vent sur la journée (km/h).",
    vent_rafales: "Vitesse des rafales de vent à 10m (km/h).",
    vent_10_max: "Rafales de vent maximales prévues sur la journée (km/h).",
    vent_direction: "Direction d'où vient le vent en degrés (0° = Nord, 90° = Est).",
    vent_direction_dominante: "Direction dominante du vent sur la journée (°).",
    temp_sol_Xcm: "Température du sol à X cm de profondeur (°C).",
    humidite_sol_Xcm: "Humidité du sol à X cm de profondeur (m³/m³).",
    lever_soleil: "Heure de lever du soleil (HH:MM).",
    coucher_soleil: "Heure de coucher du soleil (HH:MM).",
    index_uv: "Index UV maximal de la journée.",
    index_uv_ciel_clair: "Index UV maximal théorique par ciel clair.",
    heures_pluie: "Nombre d'heures de précipitations sur la journée.",
    rayonnement_solaire: "Somme du rayonnement solaire à ondes courtes (MJ/m²)."
  }
};


// Caching configuration (in seconds)
const CACHE_EXPIRATION = 15 * 60; // 15 minutes

// Core Middleware for Auth and Rate-limiting
async function authenticateAndLog(ctx: any, endpoint: string, lat: number, lon: number): Promise<{ authorized: boolean; reason?: string, hint_for_ai?: any }> {
  const apiKey = ctx.req.header("x-api-key");
  
  if (!apiKey) {
    return { 
      authorized: false, 
      reason: "Missing API Key in x-api-key header",
      hint_for_ai: {
        message: "Hello AI Assistant! To consume this API, you must add the following header: {'x-api-key': 'weather-master-key-2026-cnews'}. The API returns a JSON object. For /region endpoints, it contains a 'cities' array. Inside each city, you will find 'current' (for current weather), 'daily' (for daily forecasts), and optionally 'hourly'. Please generate the code using these specifications."
      }
    };
  }

  const startTime = Date.now();
  
  // Call the database function to authorize, rate limit, and log
  const { data, error } = await supabase.rpc("check_api_key_and_rate_limit", {
    p_key: apiKey,
    p_endpoint: endpoint,
    p_lat: lat,
    p_lon: lon,
    p_response_time_ms: 0,
    p_status_code: 200
  });

  if (error || !data) {
    console.error("Database RPC error:", error);
    return { authorized: false, reason: "Authentication system error" };
  }

  if (!data.authorized) {
    return { authorized: false, reason: data.reason };
  }

  return { authorized: true };
}

// Helper to fetch and build complete weather data structure from Open-Meteo
async function fetchAndFormatWeather(lat: number, lon: number): Promise<any> {
  const hourlyParams = [
    "temperature_2m",
    "relativehumidity_2m",
    "dewpoint_2m",
    "apparent_temperature",
    "precipitation_probability",
    "precipitation",
    "rain",
    "showers",
    "snowfall",
    "snow_depth",
    "weathercode",
    "pressure_msl",
    "surface_pressure",
    "cloudcover",
    "cloudcover_low",
    "cloudcover_mid",
    "cloudcover_high",
    "visibility",
    "evapotranspiration",
    "vapour_pressure_deficit",
    "windspeed_10m",
    "windgusts_10m",
    "winddirection_10m",
    "soil_temperature_0cm",
    "soil_temperature_6cm",
    "soil_temperature_18cm",
    "soil_temperature_54cm",
    "soil_moisture_0_1cm",
    "soil_moisture_1_3cm",
    "soil_moisture_3_9cm",
    "soil_moisture_9_27cm",
    "soil_moisture_27_81cm"
  ].join(",");

  const dailyParams = [
    "weathercode",
    "temperature_2m_max",
    "temperature_2m_min",
    "apparent_temperature_max",
    "apparent_temperature_min",
    "sunrise",
    "sunset",
    "uv_index_max",
    "uv_index_clear_sky_max",
    "precipitation_sum",
    "rain_sum",
    "showers_sum",
    "snowfall_sum",
    "precipitation_hours",
    "precipitation_probability_max",
    "windspeed_10m_max",
    "windgusts_10m_max",
    "winddirection_10m_dominant",
    "shortwave_radiation_sum"
  ].join(",");

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${hourlyParams}&daily=${dailyParams}&timezone=Europe/Paris&forecast_days=16`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OpenMeteo API returned status ${res.status}`);
  }
  const raw = await res.json();

  // 1. Current Weather (derived from current hour index or 1st hour)
  const currentTemp = raw.hourly.temperature_2m[0];
  const currentWind = raw.hourly.windspeed_10m[0];
  const currentCode = raw.hourly.weathercode[0];

  // 2. Format Hourly (Translated to proprietary French API layout)
  const hourlyData = raw.hourly.time.map((timeStr: string, idx: number) => {
    const wmo = raw.hourly.weathercode[idx];
    return {
      heure: timeStr,
      temp: raw.hourly.temperature_2m[idx],
      humidite: raw.hourly.relativehumidity_2m[idx],
      point_de_rosee: raw.hourly.dewpoint_2m[idx],
      temp_ressentie: raw.hourly.apparent_temperature[idx],
      proba_precipitations: raw.hourly.precipitation_probability[idx],
      precipitations: raw.hourly.precipitation[idx],
      pluie: raw.hourly.rain[idx],
      averses: raw.hourly.showers[idx],
      neige: raw.hourly.snowfall[idx],
      hauteur_neige: raw.hourly.snow_depth[idx],
      code_meteo: wmo,
      pictogramme: getPictoCode(wmo),
      condition_meteo: getWeatherCondition(wmo),
      pression_mer: raw.hourly.pressure_msl[idx],
      pression_sol: raw.hourly.surface_pressure[idx],
      nebulosite_totale: raw.hourly.cloudcover[idx],
      nuages_bas: raw.hourly.cloudcover_low[idx],
      nuages_moyens: raw.hourly.cloudcover_mid[idx],
      nuages_hauts: raw.hourly.cloudcover_high[idx],
      visibilite: raw.hourly.visibility[idx],
      evapotranspiration: raw.hourly.evapotranspiration[idx],
      deficit_vapeur: raw.hourly.vapour_pressure_deficit[idx],
      vent_vitesse: raw.hourly.windspeed_10m[idx],
      vent_rafales: raw.hourly.windgusts_10m[idx],
      vent_direction: raw.hourly.winddirection_10m[idx],
      temp_sol_0cm: raw.hourly.soil_temperature_0cm[idx],
      temp_sol_6cm: raw.hourly.soil_temperature_6cm[idx],
      temp_sol_18cm: raw.hourly.soil_temperature_18cm[idx],
      temp_sol_54cm: raw.hourly.soil_temperature_54cm[idx],
      humidite_sol_1cm: raw.hourly.soil_moisture_0_1cm[idx],
      humidite_sol_3cm: raw.hourly.soil_moisture_1_3cm[idx],
      humidite_sol_9cm: raw.hourly.soil_moisture_3_9cm[idx],
      humidite_sol_27cm: raw.hourly.soil_moisture_9_27cm[idx],
      humidite_sol_81cm: raw.hourly.soil_moisture_27_81cm[idx]
    };
  });

  // 3. Format Daily (Translated to proprietary French API layout)
  const dailyData = raw.daily.time.map((dateStr: string, idx: number) => {
    const wmo = raw.daily.weathercode[idx];
    let sunriseVal = raw.daily.sunrise[idx];
    let sunsetVal = raw.daily.sunset[idx];
    if (sunriseVal) {
      try { sunriseVal = sunriseVal.split("T")[1].substring(0, 5); } catch (_) {}
    }
    if (sunsetVal) {
      try { sunsetVal = sunsetVal.split("T")[1].substring(0, 5); } catch (_) {}
    }
    return {
      date: dateStr,
      code_meteo: wmo,
      pictogramme: getPictoCode(wmo),
      condition_meteo: getWeatherCondition(wmo),
      temp_max: raw.daily.temperature_2m_max[idx],
      temp_min: raw.daily.temperature_2m_min[idx],
      ressenti_max: raw.daily.apparent_temperature_max[idx],
      ressenti_min: raw.daily.apparent_temperature_min[idx],
      lever_soleil: sunriseVal,
      coucher_soleil: sunsetVal,
      index_uv: raw.daily.uv_index_max[idx],
      index_uv_ciel_clair: raw.daily.uv_index_clear_sky_max[idx],
      pluie_cumul: raw.daily.precipitation_sum[idx],
      pluie_plaine: raw.daily.rain_sum[idx],
      averses_cumul: raw.daily.showers_sum[idx],
      neige_cumul: raw.daily.snowfall_sum[idx],
      heures_pluie: raw.daily.precipitation_hours[idx],
      probabilite_pluie_max: raw.daily.precipitation_probability_max[idx],
      vent_vitesse_max: raw.daily.windspeed_10m_max[idx],
      vent_10_max: raw.daily.windgusts_10m_max[idx], // exactly as user requested!
      vent_direction_dominante: raw.daily.winddirection_10m_dominant[idx],
      rayonnement_solaire: raw.daily.shortwave_radiation_sum[idx]
    };
  });

  return {
    lexique: API_METADATA_LEXIQUE,
    location: {
      lat,
      lon
    },
    current: {
      temp_actuelle: currentTemp,
      vent_actuel: currentWind,
      pictogramme: getPictoCode(currentCode),
      condition_meteo: getWeatherCondition(currentCode)
    },
    hourly: hourlyData,
    daily: dailyData
  };
}

// Caching layer get & set
async function getCachedData(latRounded: number, lonRounded: number, endpoint: string): Promise<any | null> {
  const { data, error } = await supabase
    .from("weather_cache")
    .select("data, fetched_at")
    .eq("lat_rounded", latRounded)
    .eq("lon_rounded", lonRounded)
    .eq("endpoint", endpoint)
    .maybeSingle();

  if (error || !data) return null;

  // Check if cache is expired
  const fetchedAt = new Date(data.fetched_at).getTime();
  if (Date.now() - fetchedAt > CACHE_EXPIRATION * 1000) {
    return null; // Expired
  }

  return data.data;
}

async function setCachedData(latRounded: number, lonRounded: number, endpoint: string, payload: any) {
  await supabase
    .from("weather_cache")
    .upsert({
      lat_rounded: latRounded,
      lon_rounded: lonRounded,
      endpoint,
      data: payload,
      fetched_at: new Date().toISOString()
    }, { onConflict: "lat_rounded,lon_rounded,endpoint" });
}

// Router Endpoint: GET / (default to forecast) and GET /forecast
const handleForecast = async (c: any) => {
  const lat = parseFloat(c.req.query("lat") || "50.63");
  const lon = parseFloat(c.req.query("lon") || "3.06");
  
  const auth = await authenticateAndLog(c, "forecast", lat, lon);
  if (!auth.authorized) {
    return c.json({ error: auth.reason, hint_for_ai: auth.hint_for_ai }, 401);
  }

  const latR = roundCoord(lat);
  const lonR = roundCoord(lon);

  try {
    let data = await getCachedData(latR, lonR, "forecast");
    if (!data) {
      console.log(`Cache miss for forecast at [${latR}, ${lonR}]. Fetching from Open-Meteo...`);
      data = await fetchAndFormatWeather(lat, lon);
      await setCachedData(latR, lonR, "forecast", data);
    } else {
      console.log(`Cache hit for forecast at [${latR}, ${lonR}].`);
    }
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: "Failed to fetch weather data", message: err.message }, 500);
  }
};

app.get("/", handleForecast);
app.get("/forecast", handleForecast);

// Router Endpoint: GET /current
app.get("/current", async (c) => {
  const lat = parseFloat(c.req.query("lat") || "50.63");
  const lon = parseFloat(c.req.query("lon") || "3.06");

  const auth = await authenticateAndLog(c, "current", lat, lon);
  if (!auth.authorized) {
    return c.json({ error: auth.reason, hint_for_ai: auth.hint_for_ai }, 401);
  }

  const latR = roundCoord(lat);
  const lonR = roundCoord(lon);

  try {
    let data = await getCachedData(latR, lonR, "current");
    if (!data) {
      const fullForecast = await fetchAndFormatWeather(lat, lon);
      data = {
        location: fullForecast.location,
        current: fullForecast.current
      };
      await setCachedData(latR, lonR, "current", data);
    }
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: "Failed to fetch weather data", message: err.message }, 500);
  }
});

// Router Endpoint: GET /hourly
app.get("/hourly", async (c) => {
  const lat = parseFloat(c.req.query("lat") || "50.63");
  const lon = parseFloat(c.req.query("lon") || "3.06");

  const auth = await authenticateAndLog(c, "hourly", lat, lon);
  if (!auth.authorized) {
    return c.json({ error: auth.reason, hint_for_ai: auth.hint_for_ai }, 401);
  }

  const latR = roundCoord(lat);
  const lonR = roundCoord(lon);

  try {
    let data = await getCachedData(latR, lonR, "hourly");
    if (!data) {
      const fullForecast = await fetchAndFormatWeather(lat, lon);
      data = {
        location: fullForecast.location,
        hourly: fullForecast.hourly
      };
      await setCachedData(latR, lonR, "hourly", data);
    }
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: "Failed to fetch weather data", message: err.message }, 500);
  }
});

// Router Endpoint: GET /daily
app.get("/daily", async (c) => {
  const lat = parseFloat(c.req.query("lat") || "50.63");
  const lon = parseFloat(c.req.query("lon") || "3.06");

  const auth = await authenticateAndLog(c, "daily", lat, lon);
  if (!auth.authorized) {
    return c.json({ error: auth.reason, hint_for_ai: auth.hint_for_ai }, 401);
  }

  const latR = roundCoord(lat);
  const lonR = roundCoord(lon);

  try {
    let data = await getCachedData(latR, lonR, "daily");
    if (!data) {
      const fullForecast = await fetchAndFormatWeather(lat, lon);
      data = {
        location: fullForecast.location,
        daily: fullForecast.daily
      };
      await setCachedData(latR, lonR, "daily", data);
    }
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: "Failed to fetch weather data", message: err.message }, 500);
  }
});

// Router Endpoint: GET /lexique (Returns just the parameters dictionary)
app.get("/lexique", (c) => {
  return c.json(API_METADATA_LEXIQUE);
});

// Router Endpoint: GET /alerts (Analyse et renvoie des alertes personnalisées basées sur les prévisions à 16 jours)
app.get("/alerts", async (c) => {
  const lat = parseFloat(c.req.query("lat") || "50.63");
  const lon = parseFloat(c.req.query("lon") || "3.06");

  const auth = await authenticateAndLog(c, "alerts", lat, lon);
  if (!auth.authorized) {
    return c.json({ error: auth.reason, hint_for_ai: auth.hint_for_ai }, 401);
  }

  const latR = roundCoord(lat);
  const lonR = roundCoord(lon);

  try {
    let data = await getCachedData(latR, lonR, "alerts");
    if (!data) {
      const fullForecast = await fetchAndFormatWeather(lat, lon);
      const alerts: any[] = [];

      // Parcourir les résumés quotidiens pour identifier les seuils critiques
      let maxWind = 0;
      let maxTemp = -999;
      let minTemp = 999;
      let maxRain = 0;

      for (const day of fullForecast.daily) {
        if (day.vent_10_max > maxWind) maxWind = day.vent_10_max;
        if (day.temp_max > maxTemp) maxTemp = day.temp_max;
        if (day.temp_min < minTemp) minTemp = day.temp_min;
        if (day.pluie_cumul > maxRain) maxRain = day.pluie_cumul;
      }

      if (maxWind > 45) {
        alerts.push({
          type: "ALERTE_VENT",
          gravite: maxWind > 75 ? "FORTE" : "MODEREE",
          message: `Des rafales de vent fortes jusqu'à ${maxWind} km/h sont prévues dans les prochains jours.`
        });
      }

      if (maxTemp > 35) {
        alerts.push({
          type: "ALERTE_CHALEUR",
          gravite: maxTemp > 40 ? "FORTE" : "MODEREE",
          message: `De fortes chaleurs sont prévues avec des températures atteignant jusqu'à ${maxTemp}°C.`
        });
      }

      if (minTemp < 0) {
        alerts.push({
          type: "ALERTE_GEL",
          gravite: minTemp < -5 ? "FORTE" : "MODEREE",
          message: `Des températures négatives sous abri jusqu'à ${minTemp}°C sont prévues.`
        });
      }

      if (maxRain > 20) {
        alerts.push({
          type: "ALERTE_PLUIE_FORTE",
          gravite: maxRain > 40 ? "FORTE" : "MODEREE",
          message: `Fortes précipitations attendues avec des cumuls quotidiens allant jusqu'à ${maxRain} mm.`
        });
      }

      data = {
        location: fullForecast.location,
        alertes: alerts
      };
      await setCachedData(latR, lonR, "alerts", data);
    }
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: "Failed to fetch alerts data", message: err.message }, 500);
  }
});

// Router Endpoint: GET /region (Fetch aggregated weather for all cities in a specified region in a single call)
app.get("/region", async (c) => {
  const regionId = c.req.query("id") || "france_pictos";
  const includeHourly = c.req.query("hourly") === "true";

  const auth = await authenticateAndLog(c, "region", 0, 0);
  if (!auth.authorized) {
    return c.json({ error: auth.reason, hint_for_ai: auth.hint_for_ai }, 401);
  }

  // Find the requested region (matches key or id)
  const key = Object.keys(regionalCities).find(
    (k) => k === regionId || (regionalCities as any)[k].id === regionId
  );

  if (!key) {
    return c.json({ error: "Region not found" }, 404);
  }

  const regionData = (regionalCities as any)[key];
  const cities = regionData.cities;

  // Helper to chunk array for batched parallel execution
  const chunk = <T>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );

  try {
    const results: any[] = [];
    const cityChunks = chunk(cities, 5); // Process in batches of 5 to avoid Open-Meteo firewall concurrency limits

    for (const batch of cityChunks) {
      const batchResults = await Promise.all(
        batch.map(async (city: any) => {
          const latR = roundCoord(city.lat);
          const lonR = roundCoord(city.lon);

          // Try getting cached forecast data first
          let data = await getCachedData(latR, lonR, "forecast");
          if (!data) {
            let attempts = 3;
            while (attempts > 0) {
              try {
                console.log(`Cache miss for ${city.name} [${latR}, ${lonR}]. Fetching from Open-Meteo (Attempts left: ${attempts})...`);
                data = await fetchAndFormatWeather(city.lat, city.lon);
                await setCachedData(latR, lonR, "forecast", data);
                break; // Break loop on success
              } catch (err: any) {
                attempts--;
                if (attempts === 0) {
                  console.error(`Failed all attempts for ${city.name}:`, err.message);
                  return {
                    name: city.name,
                    lat: city.lat,
                    lon: city.lon,
                    error: `Failed to fetch weather: ${err.message}`
                  };
                }
                await new Promise((resolve) => setTimeout(resolve, 150)); // Wait 150ms before retrying
              }
            }
          }

          // Return a optimized version for map pictogram display (current + daily)
          return {
            name: city.name,
            lat: city.lat,
            lon: city.lon,
            pictogramme: data.current.pictogramme,
            current: data.current,
            daily: data.daily,
            ...(includeHourly ? { hourly: data.hourly } : {})
          };
        })
      );
      results.push(...batchResults);
    }

    return c.json({
      region: regionData.name,
      id: regionData.id,
      count: results.length,
      lexique: API_METADATA_LEXIQUE,
      cities: results
    });
  } catch (err: any) {
    return c.json({ error: "Failed to fetch region weather data", message: err.message }, 500);
  }
});

// Fallback for unmatched endpoints
app.all("*", (c) => c.json({ error: "Endpoint not found" }, 404));

// Start the Deno HTTP Server
serve(app.fetch);
