// Local verification script for Weather API Proxy

const mockOpenMeteoResponse = {
  latitude: 50.62,
  longitude: 3.05,
  hourly: {
    time: ["2026-05-28T00:00", "2026-05-28T01:00"],
    temperature_2m: [14.5, 13.8],
    relativehumidity_2m: [82, 85],
    dewpoint_2m: [11.2, 11.0],
    apparent_temperature: [13.9, 13.2],
    precipitation_probability: [0, 10],
    precipitation: [0.0, 0.0],
    rain: [0.0, 0.0],
    showers: [0.0, 0.0],
    snowfall: [0.0, 0.0],
    snow_depth: [0.0, 0.0],
    weathercode: [0, 1],
    pressure_msl: [1015.2, 1014.8],
    surface_pressure: [1011.0, 1010.5],
    cloudcover: [10, 30],
    cloudcover_low: [5, 10],
    cloudcover_mid: [0, 20],
    cloudcover_high: [15, 40],
    visibility: [10000, 10000],
    evapotranspiration: [0.0, 0.0],
    vapour_pressure_deficit: [0.2, 0.1],
    windspeed_10m: [12.0, 14.2],
    windgusts_10m: [18.5, 22.0],
    winddirection_10m: [240, 250],
    soil_temperature_0cm: [15.2, 14.8],
    soil_temperature_6cm: [15.8, 15.6],
    soil_temperature_18cm: [16.2, 16.2],
    soil_temperature_54cm: [15.5, 15.5],
    soil_moisture_0_1cm: [0.22, 0.22],
    soil_moisture_1_3cm: [0.24, 0.24],
    soil_moisture_3_9cm: [0.26, 0.26],
    soil_moisture_9_27cm: [0.28, 0.28],
    soil_moisture_27_81cm: [0.30, 0.30]
  },
  daily: {
    time: ["2026-05-28"],
    weathercode: [0],
    temperature_2m_max: [21.5],
    temperature_2m_min: [12.2],
    apparent_temperature_max: [20.8],
    apparent_temperature_min: [11.5],
    sunrise: ["2026-05-28T06:02"],
    sunset: ["2026-05-28T21:45"],
    uv_index_max: [5.8],
    uv_index_clear_sky_max: [6.2],
    precipitation_sum: [0.0],
    rain_sum: [0.0],
    showers_sum: [0.0],
    snowfall_sum: [0.0],
    precipitation_hours: [0.0],
    precipitation_probability_max: [10],
    windspeed_10m_max: [16.5],
    windgusts_10m_max: [28.0],
    winddirection_10m_dominant: [245],
    shortwave_radiation_sum: [18.2]
  }
};

function getWeatherCondition(code) {
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

function getPictoCode(wmoCode) {
  const map = {
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

function formatWeatherData(raw) {
  const currentTemp = raw.hourly.temperature_2m[0];
  const currentWind = raw.hourly.windspeed_10m[0];
  const currentCode = raw.hourly.weathercode[0];

  const hourlyData = raw.hourly.time.map((timeStr, idx) => {
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

  const dailyData = raw.daily.time.map((dateStr, idx) => {
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
      vent_10_max: raw.daily.windgusts_10m_max[idx],
      vent_direction_dominante: raw.daily.winddirection_10m_dominant[idx],
      rayonnement_solaire: raw.daily.shortwave_radiation_sum[idx]
    };
  });

  return {
    location: {
      lat: raw.latitude,
      lon: raw.longitude
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

console.log("=== WEATHER API PROXY FORMAT TESTING ===");
try {
  const result = formatWeatherData(mockOpenMeteoResponse);
  
  // Verify main keys
  const expectedKeys = ["location", "current", "hourly", "daily"];
  const actualKeys = Object.keys(result);
  
  const allKeysPresent = expectedKeys.every(k => actualKeys.includes(k));
  if (allKeysPresent) {
    console.log("✅ SUCCESS: All custom structure keys are present.");
  } else {
    throw new Error(`MISSING KEYS: Expected ${expectedKeys.join(', ')} but got ${actualKeys.join(', ')}`);
  }

  // Verify Location
  if (result.location.lat === 50.62 && result.location.lon === 3.05) {
    console.log("✅ SUCCESS: Location coordinates are correct.");
  } else {
    throw new Error("Location coordinates mismatch");
  }

  // Verify Current Conditions
  if (result.current.temp_actuelle === 14.5 && result.current.vent_actuel === 12.0 && result.current.condition_meteo === "Ensoleillé") {
    console.log("✅ SUCCESS: Current conditions correctly mapped and formatted.");
  } else {
    throw new Error("Current conditions mismatch");
  }

  // Verify Hourly mapping
  const firstHour = result.hourly[0];
  if (firstHour.humidite === 82 && firstHour.vent_rafales === 18.5 && firstHour.condition_meteo === "Ensoleillé") {
    console.log("✅ SUCCESS: Hourly variables correctly renamed and mapped.");
  } else {
    throw new Error("Hourly variables mapping mismatch");
  }

  // Verify Daily mapping
  const firstDay = result.daily[0];
  if (firstDay.temp_max === 21.5 && firstDay.lever_soleil === "06:02" && firstDay.condition_meteo === "Ensoleillé") {
    console.log("✅ SUCCESS: Daily variables mapped correctly.");
  } else {
    throw new Error("Daily variables mapping mismatch");
  }

  console.log("\nALL MOCK TESTS PASSED SUCCESSFULLY! The custom formatting engine matches the specification.");
} catch (e) {
  console.error("❌ TEST FAILED:", e.message);
  process.exit(1);
}
