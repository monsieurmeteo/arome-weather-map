"""
generate_all_regions_csv.py
----------------------------
Génère des fichiers CSV pour TOUTES les régions définies dans regional_cities.json.
Les noms de colonnes sont IDENTIQUES à ceux utilisés par l'API Météo Climat Pro.

Utilisation :
    python generate_all_regions_csv.py
    
Résultat : un dossier "exports_csv/" contenant 2 fichiers par région :
    - {region_id}_daily.csv   (prévisions journalières sur 16 jours)
    - {region_id}_hourly.csv  (prévisions horaires sur 16 jours)
"""

import requests
import csv
import json
import os
import time
from datetime import datetime

# ============================================================
# CONFIGURATION
# ============================================================
REGIONAL_CITIES_FILE = os.path.join(os.path.dirname(__file__), "supabase", "regional_cities.json")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "exports_csv")
FORECAST_DAYS = 16
REQUEST_DELAY = 0.3  # Délai en secondes entre les requêtes (pour éviter d'être bloqué)

# ============================================================
# MAPPING DES CODES MÉTÉO (identique à l'API)
# ============================================================

PICTO_MAP = {
    0: 'P1',   # Soleil
    1: 'P2',   # Peu nuageux
    2: 'P8',   # Nuageux
    3: 'P4',   # Très nuageux
    5: 'P6',   # Soleil voilé
    13: 'P6',
    45: 'brouillards',
    48: 'brouillards',
    51: 'P10', # Pluies faibles
    53: 'P10',
    55: 'P10',
    61: 'P10',
    63: 'P10',
    65: 'P11', # Fortes pluies
    71: 'P12', # Neige
    73: 'P12',
    75: 'P12',
    77: 'P12',
    80: 'P9',  # Averses
    81: 'P9',
    82: 'P9',
    85: 'P12', # Averses de neige
    86: 'P12',
    95: 'P10', # Orages
    96: 'P10',
    99: 'P10'
}

CONDITION_MAP = {
    0: "Ensoleillé",
    1: "Éclaircies",
    2: "Éclaircies",
    3: "Nuageux",
    45: "Brouillard",
    48: "Brouillard",
}

def get_picto_code(wmo_code):
    """Retourne le code pictogramme P1..P12 correspondant au code WMO (identique à l'API)."""
    if wmo_code is None:
        return ""
    return PICTO_MAP.get(int(wmo_code), 'P1')

def get_weather_condition(wmo_code):
    """Retourne le texte météo en français (identique à l'API)."""
    if wmo_code is None:
        return ""
    code = int(wmo_code)
    if code == 0: return "Ensoleillé"
    if code in (1, 2): return "Éclaircies"
    if code == 3: return "Nuageux"
    if code in (45, 48): return "Brouillard"
    if 51 <= code <= 55: return "Pluie faible"
    if 61 <= code <= 65: return "Pluie"
    if 71 <= code <= 77: return "Neige"
    if 80 <= code <= 82: return "Averses"
    if 85 <= code <= 86: return "Averses de neige"
    if 95 <= code <= 99: return "Orageux"
    return "Clair"


# ============================================================
# RÉCUPÉRATION DES DONNÉES MÉTÉO (API Open-Meteo)
# ============================================================

HOURLY_PARAMS = [
    "temperature_2m", "relativehumidity_2m", "dewpoint_2m", "apparent_temperature",
    "precipitation_probability", "precipitation", "rain", "showers", "snowfall",
    "snow_depth", "weathercode", "pressure_msl", "surface_pressure", "cloudcover",
    "cloudcover_low", "cloudcover_mid", "cloudcover_high", "visibility",
    "evapotranspiration", "vapour_pressure_deficit", "windspeed_10m", "windgusts_10m",
    "winddirection_10m", "soil_temperature_0cm", "soil_temperature_6cm",
    "soil_temperature_18cm", "soil_temperature_54cm", "soil_moisture_0_1cm",
    "soil_moisture_1_3cm", "soil_moisture_3_9cm", "soil_moisture_9_27cm",
    "soil_moisture_27_81cm"
]

DAILY_PARAMS = [
    "weathercode", "temperature_2m_max", "temperature_2m_min", "apparent_temperature_max",
    "apparent_temperature_min", "sunrise", "sunset", "uv_index_max", "uv_index_clear_sky_max",
    "precipitation_sum", "rain_sum", "showers_sum", "snowfall_sum", "precipitation_hours",
    "precipitation_probability_max", "windspeed_10m_max", "windgusts_10m_max",
    "winddirection_10m_dominant", "shortwave_radiation_sum"
]

def fetch_city_weather(lat, lon, retries=3):
    """Interroge l'API météo pour une ville et retourne les données brutes."""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ",".join(HOURLY_PARAMS),
        "daily": ",".join(DAILY_PARAMS),
        "timezone": "Europe/Paris",
        "forecast_days": FORECAST_DAYS
    }
    for attempt in range(retries):
        try:
            resp = requests.get(url, params=params, timeout=30)
            if resp.status_code == 200:
                return resp.json()
            else:
                print(f"    [WARN] HTTP {resp.status_code} pour lat={lat},lon={lon}. Tentative {attempt+1}/{retries}...")
                time.sleep(1)
        except Exception as e:
            print(f"    [ERREUR] Exception pour lat={lat},lon={lon}: {e}. Tentative {attempt+1}/{retries}...")
            time.sleep(1)
    return None


# ============================================================
# GÉNÉRATION DES FICHIERS CSV (noms de colonnes = API)
# ============================================================

# En-têtes DAILY — strictement identiques aux champs retournés par l'API Open-Meteo
DAILY_HEADERS = [
    "Ville", "Latitude", "Longitude",
    "Date",
    "weathercode", "pictogramme", "condition_meteo",
    "temperature_2m_max", "temperature_2m_min",
    "apparent_temperature_max", "apparent_temperature_min",
    "sunrise", "sunset",
    "uv_index_max", "uv_index_clear_sky_max",
    "precipitation_sum", "rain_sum", "showers_sum", "snowfall_sum",
    "precipitation_hours", "precipitation_probability_max",
    "windspeed_10m_max", "windgusts_10m_max", "winddirection_10m_dominant",
    "shortwave_radiation_sum"
]

# En-têtes HOURLY — strictement identiques aux champs retournés par l'API Open-Meteo
HOURLY_HEADERS = [
    "Ville", "Latitude", "Longitude",
    "Date", "Heure",
    "temperature_2m", "relativehumidity_2m", "dewpoint_2m", "apparent_temperature",
    "precipitation_probability", "precipitation", "rain", "showers", "snowfall", "snow_depth",
    "weathercode", "pictogramme", "condition_meteo",
    "pressure_msl", "surface_pressure",
    "cloudcover", "cloudcover_low", "cloudcover_mid", "cloudcover_high",
    "visibility", "evapotranspiration", "vapour_pressure_deficit",
    "windspeed_10m", "windgusts_10m", "winddirection_10m",
    "soil_temperature_0cm", "soil_temperature_6cm", "soil_temperature_18cm", "soil_temperature_54cm",
    "soil_moisture_0_1cm", "soil_moisture_1_3cm", "soil_moisture_3_9cm",
    "soil_moisture_9_27cm", "soil_moisture_27_81cm"
]


def format_daily_row(city, raw, day_idx):
    """Formate une ligne journalière avec les mêmes noms que l'API."""
    d = raw["daily"]
    wmo = d["weathercode"][day_idx]
    
    # Formatage lever/coucher soleil (HH:MM uniquement)
    sunrise = d["sunrise"][day_idx] or ""
    sunset = d["sunset"][day_idx] or ""
    if sunrise and "T" in sunrise:
        sunrise = sunrise.split("T")[1][:5]
    if sunset and "T" in sunset:
        sunset = sunset.split("T")[1][:5]
    
    date_str = d["time"][day_idx]
    date_formatted = datetime.strptime(date_str, "%Y-%m-%d").strftime("%d/%m/%Y")
    
    return [
        city["name"], city["lat"], city["lon"],
        date_formatted,
        wmo, get_picto_code(wmo), get_weather_condition(wmo),
        d["temperature_2m_max"][day_idx], d["temperature_2m_min"][day_idx],
        d["apparent_temperature_max"][day_idx], d["apparent_temperature_min"][day_idx],
        sunrise, sunset,
        d["uv_index_max"][day_idx], d["uv_index_clear_sky_max"][day_idx],
        d["precipitation_sum"][day_idx], d["rain_sum"][day_idx],
        d["showers_sum"][day_idx], d["snowfall_sum"][day_idx],
        d["precipitation_hours"][day_idx], d["precipitation_probability_max"][day_idx],
        d["windspeed_10m_max"][day_idx], d["windgusts_10m_max"][day_idx],
        d["winddirection_10m_dominant"][day_idx],
        d["shortwave_radiation_sum"][day_idx]
    ]


def format_hourly_row(city, raw, hour_idx):
    """Formate une ligne horaire avec les mêmes noms que l'API."""
    h = raw["hourly"]
    wmo = h["weathercode"][hour_idx]
    
    dt_str = h["time"][hour_idx]
    dt = datetime.fromisoformat(dt_str)
    
    return [
        city["name"], city["lat"], city["lon"],
        dt.strftime("%d/%m/%Y"), dt.strftime("%H:%M"),
        h["temperature_2m"][hour_idx],
        h["relativehumidity_2m"][hour_idx],
        h["dewpoint_2m"][hour_idx],
        h["apparent_temperature"][hour_idx],
        h["precipitation_probability"][hour_idx],
        h["precipitation"][hour_idx],
        h["rain"][hour_idx],
        h["showers"][hour_idx],
        h["snowfall"][hour_idx],
        h["snow_depth"][hour_idx],
        wmo, get_picto_code(wmo), get_weather_condition(wmo),
        h["pressure_msl"][hour_idx],
        h["surface_pressure"][hour_idx],
        h["cloudcover"][hour_idx],
        h["cloudcover_low"][hour_idx],
        h["cloudcover_mid"][hour_idx],
        h["cloudcover_high"][hour_idx],
        h["visibility"][hour_idx],
        h["evapotranspiration"][hour_idx],
        h["vapour_pressure_deficit"][hour_idx],
        h["windspeed_10m"][hour_idx],
        h["windgusts_10m"][hour_idx],
        h["winddirection_10m"][hour_idx],
        h["soil_temperature_0cm"][hour_idx],
        h["soil_temperature_6cm"][hour_idx],
        h["soil_temperature_18cm"][hour_idx],
        h["soil_temperature_54cm"][hour_idx],
        h["soil_moisture_0_1cm"][hour_idx],
        h["soil_moisture_1_3cm"][hour_idx],
        h["soil_moisture_3_9cm"][hour_idx],
        h["soil_moisture_9_27cm"][hour_idx],
        h["soil_moisture_27_81cm"][hour_idx]
    ]


def generate_region_csvs(region_id, region_info, output_dir):
    """Génère les deux fichiers CSV (daily + hourly) pour une région donnée."""
    cities = region_info["cities"]
    region_name = region_info.get("name", region_id)
    
    print(f"\n{'='*60}")
    print(f"  Région : {region_name} ({region_id}) — {len(cities)} villes")
    print(f"{'='*60}")
    
    # Préparer les fichiers
    daily_path = os.path.join(output_dir, f"{region_id}_daily.csv")
    hourly_path = os.path.join(output_dir, f"{region_id}_hourly.csv")
    
    daily_rows = []
    hourly_rows = []
    
    for i, city in enumerate(cities):
        city_name = city.get("name", "?")
        print(f"  [{i+1}/{len(cities)}] {city_name} (lat={city['lat']}, lon={city['lon']})...", end="", flush=True)
        
        raw = fetch_city_weather(city["lat"], city["lon"])
        if raw is None:
            print(" ECHEC")
            continue
        
        # Daily rows
        for day_idx in range(len(raw["daily"]["time"])):
            daily_rows.append(format_daily_row(city, raw, day_idx))
        
        # Hourly rows
        for hour_idx in range(len(raw["hourly"]["time"])):
            hourly_rows.append(format_hourly_row(city, raw, hour_idx))
        
        print(f" OK ({len(raw['daily']['time'])} jours)")
        time.sleep(REQUEST_DELAY)
    
    # Écriture CSV Daily
    with open(daily_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow(DAILY_HEADERS)
        writer.writerows(daily_rows)
    print(f"\n  ✔ Daily  : {daily_path}")
    
    # Écriture CSV Hourly
    with open(hourly_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow(HOURLY_HEADERS)
        writer.writerows(hourly_rows)
    print(f"  ✔ Hourly : {hourly_path}")
    
    return len(daily_rows), len(hourly_rows)


# ============================================================
# POINT D'ENTRÉE PRINCIPAL
# ============================================================

def main():
    print("\n" + "="*60)
    print("  Générateur CSV — API Météo Climat Pro")
    print("  Toutes les régions | Mêmes colonnes que l'API")
    print("="*60)
    
    # Charger le fichier de configuration des régions
    if not os.path.exists(REGIONAL_CITIES_FILE):
        print(f"[ERREUR] Fichier introuvable : {REGIONAL_CITIES_FILE}")
        return
    
    with open(REGIONAL_CITIES_FILE, "r", encoding="utf-8") as f:
        all_regions = json.load(f)
    
    print(f"\n{len(all_regions)} régions trouvées dans regional_cities.json")
    
    # Créer le dossier de sortie
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Dossier de sortie : {OUTPUT_DIR}\n")
    
    # Générer les CSV pour chaque région
    total_regions = 0
    total_daily_rows = 0
    total_hourly_rows = 0
    
    for region_id, region_info in all_regions.items():
        d_count, h_count = generate_region_csvs(region_id, region_info, OUTPUT_DIR)
        total_regions += 1
        total_daily_rows += d_count
        total_hourly_rows += h_count
    
    # Résumé final
    print(f"\n{'='*60}")
    print(f"  GÉNÉRATION TERMINÉE !")
    print(f"{'='*60}")
    print(f"  Régions traitées   : {total_regions}")
    print(f"  Fichiers créés     : {total_regions * 2} CSV")
    print(f"  Lignes daily total : {total_daily_rows:,}")
    print(f"  Lignes horaires    : {total_hourly_rows:,}")
    print(f"  Dossier de sortie  : {OUTPUT_DIR}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
