import requests
import csv
import json
from datetime import datetime

# Villes utilisées dans l'onglet FRANCE - PICTOS
CITIES = [
    { "name": "BREST", "lat": 48.39, "lon": -4.48 },
    { "name": "RENNES", "lat": 48.11, "lon": -1.67 },
    { "name": "CHERBOURG", "lat": 49.63, "lon": -1.62 },
    { "name": "ROUEN", "lat": 49.44, "lon": 1.10 },
    { "name": "PARIS", "lat": 48.85, "lon": 2.35 },
    { "name": "LILLE", "lat": 50.62, "lon": 3.05 },
    { "name": "BOULOGNE-SUR-MER", "lat": 50.726, "lon": 1.614 },
    { "name": "REIMS", "lat": 49.25, "lon": 4.03 },
    { "name": "METZ", "lat": 49.11, "lon": 6.17 },
    { "name": "NANTES", "lat": 47.21, "lon": -1.55 },
    { "name": "TOURS", "lat": 47.39, "lon": 0.68 },
    { "name": "AUXERRE", "lat": 47.79, "lon": 3.57 },
    { "name": "CHAUMONT", "lat": 48.11, "lon": 5.14 },
    { "name": "STRASBOURG", "lat": 48.57, "lon": 7.75 },
    { "name": "BOURGES", "lat": 47.08, "lon": 2.39 },
    { "name": "BELFORT", "lat": 47.63, "lon": 6.86 },
    { "name": "LIMOGES", "lat": 45.83, "lon": 1.26 },
    { "name": "VICHY", "lat": 46.12, "lon": 3.42 },
    { "name": "LYON", "lat": 45.76, "lon": 4.83 },
    { "name": "PONTARLIER", "lat": 46.90, "lon": 6.35 },
    { "name": "LA ROCHELLE", "lat": 46.16, "lon": -1.15 },
    { "name": "BORDEAUX", "lat": 44.83, "lon": -0.57 },
    { "name": "BIARRITZ", "lat": 43.48, "lon": -1.56 },
    { "name": "TARBES", "lat": 43.23, "lon": 0.07 },
    { "name": "TOULOUSE", "lat": 43.60, "lon": 1.44 },
    { "name": "AURILLAC", "lat": 44.92, "lon": 2.44 },
    { "name": "MONTÉLIMAR", "lat": 44.55, "lon": 4.75 },
    { "name": "GAP", "lat": 44.55, "lon": 6.07 },
    { "name": "PERPIGNAN", "lat": 42.69, "lon": 2.89 },
    { "name": "MONTPELLIER", "lat": 43.61, "lon": 3.87 },
    { "name": "MARSEILLE", "lat": 43.296, "lon": 5.381 },
    { "name": "AMIENS", "lat": 49.894, "lon": 2.295 },
    { "name": "NICE", "lat": 43.71, "lon": 7.26 },
    { "name": "AJACCIO", "lat": 41.92, "lon": 8.73 },
    { "name": "BASTIA", "lat": 42.69, "lon": 9.45 },
    { "name": "ALENÇON", "lat": 48.43, "lon": 0.09 },
    { "name": "BOURG-ST-MAURICE", "lat": 45.62, "lon": 6.77 },
    { "name": "CHALON/SAÔNE", "lat": 46.78, "lon": 4.85 },
    { "name": "AGEN", "lat": 44.20, "lon": 0.61 }
]

def fetch_weather_data():
    lats = ",".join(str(c["lat"]) for c in CITIES)
    lons = ",".join(str(c["lon"]) for c in CITIES)
    
    # Paramètres horaires de l'API Open-Meteo (Le maximum possible supporté)
    hourly_params = [
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
    ]
    
    # Paramètres journaliers de l'API Open-Meteo
    daily_params = [
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
    ]
    
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lats,
        "longitude": lons,
        "hourly": ",".join(hourly_params),
        "daily": ",".join(daily_params),
        "timezone": "Europe/Paris",
        "forecast_days": 16
    }
    
    print("Fetching weather data from Open-Meteo...")
    response = requests.get(url, params=params)
    if response.status_code != 200:
        raise Exception(f"Error fetching data from API: {response.status_code} - {response.text}")
    
    return response.json()

def generate_csvs(data):
    # Si l'API retourne une liste pour plusieurs coordonnées
    locations_data = data if isinstance(data, list) else [data]
    
    # --- 1. GÉNÉRATION DU FICHIER JOURNALIER (DAILY) ---
    daily_file = "france_pictos_daily_forecast.csv"
    print(f"Generating {daily_file}...")
    
    daily_headers = ["Ville", "Latitude", "Longitude", "Date"]
    # Déterminer dynamiquement les clés disponibles dans daily
    sample_daily = locations_data[0]["daily"]
    daily_keys = [k for k in sample_daily.keys() if k != "time"]
    daily_headers.extend(daily_keys)
    
    with open(daily_file, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow(daily_headers)
        
        for idx, city in enumerate(CITIES):
            loc = locations_data[idx]
            daily = loc["daily"]
            times = daily["time"]
            
            for day_idx, t in enumerate(times):
                row = [
                    city["name"],
                    city["lat"],
                    city["lon"],
                    datetime.strptime(t, "%Y-%m-%d").strftime("%d/%m/%Y")
                ]
                for key in daily_keys:
                    val = daily[key][day_idx]
                    # Formatage des dates/heures de lever/coucher de soleil si nécessaire
                    if key in ["sunrise", "sunset"] and val:
                        try:
                            val = datetime.fromisoformat(val).strftime("%H:%M")
                        except ValueError:
                            pass
                    row.append(val if val is not None else "")
                writer.writerow(row)
                
    # --- 2. GÉNÉRATION DU FICHIER HORAIRE (HOURLY) ---
    hourly_file = "france_pictos_hourly_forecast.csv"
    print(f"Generating {hourly_file}...")
    
    hourly_headers = ["Ville", "Latitude", "Longitude", "Date", "Heure"]
    sample_hourly = locations_data[0]["hourly"]
    hourly_keys = [k for k in sample_hourly.keys() if k != "time"]
    hourly_headers.extend(hourly_keys)
    
    with open(hourly_file, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow(hourly_headers)
        
        for idx, city in enumerate(CITIES):
            loc = locations_data[idx]
            hourly = loc["hourly"]
            times = hourly["time"]
            
            for hour_idx, t in enumerate(times):
                dt = datetime.fromisoformat(t)
                row = [
                    city["name"],
                    city["lat"],
                    city["lon"],
                    dt.strftime("%d/%m/%Y"),
                    dt.strftime("%H:%M")
                ]
                for key in hourly_keys:
                    val = hourly[key][hour_idx]
                    row.append(val if val is not None else "")
                writer.writerow(row)

    print("Success! Both CSV files have been created.")

if __name__ == "__main__":
    try:
        data = fetch_weather_data()
        generate_csvs(data)
    except Exception as e:
        print(f"An error occurred: {e}")
