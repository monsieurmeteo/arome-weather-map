import os
import json
import urllib.request
import urllib.parse
from datetime import datetime, timedelta

# Configuration des chemins
PROJECT_DIR = os.path.abspath(os.path.dirname(__file__))
OUTPUT_DIR = os.path.join(PROJECT_DIR, "exports_csv")
VIGISEUILS_PATH = r"C:\Users\grego\.gemini\config\skills\vigilance\vigiseuils.json"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# Liste des 13 régions métropolitaines françaises
REGIONS_INFO = {
    "ara": "Auvergne-Rhône-Alpes",
    "bfc": "Bourgogne-Franche-Comté",
    "bretagne": "Bretagne",
    "cvl": "Centre-Val de Loire",
    "corse": "Corse",
    "grand-est": "Grand Est",
    "hdf": "Hauts-de-France",
    "ile-de-france": "Île-de-France",
    "normandie": "Normandie",
    "naq": "Nouvelle-Aquitaine",
    "occitanie": "Occitanie",
    "pdl": "Pays de la Loire",
    "paca": "Provence-Alpes-Côte d'Azur"
}

# Configuration des 96 départements (Préfectures + coordonnées)
DEPARTEMENTS_CONFIG = {
    "01": {"name": "Ain", "region": "ara", "pref": "Bourg-en-Bresse", "lat": 46.2052, "lon": 5.2256},
    "02": {"name": "Aisne", "region": "hdf", "pref": "Laon", "lat": 49.5642, "lon": 3.6218},
    "03": {"name": "Allier", "region": "ara", "pref": "Moulins", "lat": 46.5681, "lon": 3.3344},
    "04": {"name": "Alpes-de-Haute-Provence", "region": "paca", "pref": "Digne-les-Bains", "lat": 44.0922, "lon": 6.2361},
    "05": {"name": "Hautes-Alpes", "region": "paca", "pref": "Gap", "lat": 44.5596, "lon": 6.0798},
    "06": {"name": "Alpes-Maritimes", "region": "paca", "pref": "Nice", "lat": 43.7031, "lon": 7.2661},
    "07": {"name": "Ardèche", "region": "ara", "pref": "Privas", "lat": 44.7351, "lon": 4.5989},
    "08": {"name": "Ardennes", "region": "grand-est", "pref": "Charleville-Mézières", "lat": 49.7719, "lon": 4.7161},
    "09": {"name": "Ariège", "region": "occitanie", "pref": "Foix", "lat": 42.9639, "lon": 1.6053},
    "10": {"name": "Aube", "region": "grand-est", "pref": "Troyes", "lat": 48.2975, "lon": 4.0744},
    "11": {"name": "Aude", "region": "occitanie", "pref": "Carcassonne", "lat": 43.2122, "lon": 2.3536},
    "12": {"name": "Aveyron", "region": "occitanie", "pref": "Rodez", "lat": 44.3508, "lon": 2.5756},
    "13": {"name": "Bouches-du-Rhône", "region": "paca", "pref": "Marseille", "lat": 43.2964, "lon": 5.3698},
    "14": {"name": "Calvados", "region": "normandie", "pref": "Caen", "lat": 49.1833, "lon": -0.3500},
    "15": {"name": "Cantal", "region": "ara", "pref": "Aurillac", "lat": 44.9256, "lon": 2.4419},
    "16": {"name": "Charente", "region": "naq", "pref": "Angoulême", "lat": 45.6484, "lon": 0.1562},
    "17": {"name": "Charente-Maritime", "region": "naq", "pref": "La Rochelle", "lat": 46.1601, "lon": -1.1511},
    "18": {"name": "Cher", "region": "cvl", "pref": "Bourges", "lat": 47.0833, "lon": 2.4000},
    "19": {"name": "Corrèze", "region": "naq", "pref": "Tulle", "lat": 45.2678, "lon": 1.7719},
    "21": {"name": "Côte-d'Or", "region": "bfc", "pref": "Dijon", "lat": 47.3231, "lon": 5.0419},
    "22": {"name": "Côtes-d'Armor", "region": "bretagne", "pref": "Saint-Brieuc", "lat": 48.5136, "lon": -2.7653},
    "23": {"name": "Creuse", "region": "naq", "pref": "Guéret", "lat": 46.1714, "lon": 1.8714},
    "24": {"name": "Dordogne", "region": "naq", "pref": "Périgueux", "lat": 45.1839, "lon": 0.7217},
    "25": {"name": "Doubs", "region": "bfc", "pref": "Besançon", "lat": 47.2378, "lon": 6.0244},
    "26": {"name": "Drôme", "region": "ara", "pref": "Valence", "lat": 44.9333, "lon": 4.8917},
    "27": {"name": "Eure", "region": "normandie", "pref": "Évreux", "lat": 49.0242, "lon": 1.1508},
    "28": {"name": "Eure-et-Loir", "region": "cvl", "pref": "Chartres", "lat": 48.4439, "lon": 1.4881},
    "29": {"name": "Finistère", "region": "bretagne", "pref": "Quimper", "lat": 47.9964, "lon": -4.1028},
    "2A": {"name": "Corse-du-Sud", "region": "corse", "pref": "Ajaccio", "lat": 41.9272, "lon": 8.7381},
    "2B": {"name": "Haute-Corse", "region": "corse", "pref": "Bastia", "lat": 42.6975, "lon": 9.4517},
    "30": {"name": "Gard", "region": "occitanie", "pref": "Nîmes", "lat": 43.8367, "lon": 4.3600},
    "31": {"name": "Haute-Garonne", "region": "occitanie", "pref": "Toulouse", "lat": 43.6042, "lon": 1.4436},
    "32": {"name": "Gers", "region": "occitanie", "pref": "Auch", "lat": 43.6461, "lon": 0.5847},
    "33": {"name": "Gironde", "region": "naq", "pref": "Bordeaux", "lat": 44.8378, "lon": -0.5792},
    "34": {"name": "Hérault", "region": "occitanie", "pref": "Montpellier", "lat": 43.6108, "lon": 3.8761},
    "35": {"name": "Ille-et-Vilaine", "region": "bretagne", "pref": "Rennes", "lat": 48.1135, "lon": -1.6758},
    "36": {"name": "Indre", "region": "cvl", "pref": "Châteauroux", "lat": 46.8117, "lon": 1.6989},
    "37": {"name": "Indre-et-Loire", "region": "cvl", "pref": "Tours", "lat": 47.3942, "lon": 0.6864},
    "38": {"name": "Isère", "region": "ara", "pref": "Grenoble", "lat": 45.1885, "lon": 5.7247},
    "39": {"name": "Jura", "region": "bfc", "pref": "Lons-le-Saunier", "lat": 46.6747, "lon": 5.5564},
    "40": {"name": "Landes", "region": "naq", "pref": "Mont-de-Marsan", "lat": 43.8903, "lon": -0.5003},
    "41": {"name": "Loir-et-Cher", "region": "cvl", "pref": "Blois", "lat": 47.5861, "lon": 1.3328},
    "42": {"name": "Loire", "region": "ara", "pref": "Saint-Étienne", "lat": 45.4397, "lon": 4.3872},
    "43": {"name": "Haute-Loire", "region": "ara", "pref": "Le Puy-en-Velay", "lat": 45.0428, "lon": 3.8828},
    "44": {"name": "Loire-Atlantique", "region": "pdl", "pref": "Nantes", "lat": 47.2184, "lon": -1.5536},
    "45": {"name": "Loiret", "region": "cvl", "pref": "Orléans", "lat": 47.9028, "lon": 1.9089},
    "46": {"name": "Lot", "region": "occitanie", "pref": "Cahors", "lat": 44.4475, "lon": 1.4419},
    "47": {"name": "Lot-et-Garonne", "region": "naq", "pref": "Agen", "lat": 44.2031, "lon": 0.6167},
    "48": {"name": "Lozère", "region": "occitanie", "pref": "Mende", "lat": 44.5178, "lon": 3.5019},
    "49": {"name": "Maine-et-Loire", "region": "pdl", "pref": "Angers", "lat": 47.4736, "lon": -0.5542},
    "50": {"name": "Manche", "region": "normandie", "pref": "Saint-Lô", "lat": 49.1158, "lon": -1.0908},
    "51": {"name": "Marne", "region": "grand-est", "pref": "Châlons-en-Champagne", "lat": 48.9558, "lon": 4.3644},
    "52": {"name": "Haute-Marne", "region": "grand-est", "pref": "Chaumont", "lat": 48.1114, "lon": 5.1417},
    "53": {"name": "Mayenne", "region": "pdl", "pref": "Laval", "lat": 48.0733, "lon": -0.7719},
    "54": {"name": "Meurthe-et-Moselle", "region": "grand-est", "pref": "Nancy", "lat": 48.6925, "lon": 6.1844},
    "55": {"name": "Meuse", "region": "grand-est", "pref": "Bar-le-Duc", "lat": 48.7719, "lon": 5.1617},
    "56": {"name": "Morbihan", "region": "bretagne", "pref": "Vannes", "lat": 47.6581, "lon": -2.7600},
    "57": {"name": "Moselle", "region": "grand-est", "pref": "Metz", "lat": 49.1194, "lon": 6.1758},
    "58": {"name": "Nièvre", "region": "bfc", "pref": "Nevers", "lat": 46.9933, "lon": 3.1600},
    "59": {"name": "Nord", "region": "hdf", "pref": "Lille", "lat": 50.6292, "lon": 3.0573},
    "60": {"name": "Oise", "region": "hdf", "pref": "Beauvais", "lat": 49.4303, "lon": 2.0831},
    "61": {"name": "Orne", "region": "normandie", "pref": "Alençon", "lat": 48.4319, "lon": 0.0911},
    "62": {"name": "Pas-de-Calais", "region": "hdf", "pref": "Arras", "lat": 50.2922, "lon": 2.7800},
    "63": {"name": "Puy-de-Dôme", "region": "ara", "pref": "Clermont-Ferrand", "lat": 45.7772, "lon": 3.0825},
    "64": {"name": "Pyrénées-Atlantiques", "region": "naq", "pref": "Pau", "lat": 43.2953, "lon": -0.3708},
    "65": {"name": "Hautes-Pyrénées", "region": "occitanie", "pref": "Tarbes", "lat": 43.2333, "lon": 0.0833},
    "66": {"name": "Pyrénées-Orientales", "region": "occitanie", "pref": "Perpignan", "lat": 42.6986, "lon": 2.8956},
    "67": {"name": "Bas-Rhin", "region": "grand-est", "pref": "Strasbourg", "lat": 48.5734, "lon": 7.7521},
    "68": {"name": "Haut-Rhin", "region": "grand-est", "pref": "Colmar", "lat": 48.0792, "lon": 7.3585},
    "69": {"name": "Rhône", "region": "ara", "pref": "Lyon", "lat": 45.7640, "lon": 4.8357},
    "70": {"name": "Haute-Saône", "region": "bfc", "pref": "Vesoul", "lat": 47.6214, "lon": 6.1558},
    "71": {"name": "Saône-et-Loire", "region": "bfc", "pref": "Mâcon", "lat": 46.3072, "lon": 4.8283},
    "72": {"name": "Sarthe", "region": "pdl", "pref": "Le Mans", "lat": 48.0061, "lon": 0.1994},
    "73": {"name": "Savoie", "region": "ara", "pref": "Chambéry", "lat": 45.5644, "lon": 5.9178},
    "74": {"name": "Haute-Savoie", "region": "ara", "pref": "Annecy", "lat": 45.8992, "lon": 6.1294},
    "75": {"name": "Paris", "region": "ile-de-france", "pref": "Paris", "lat": 48.8566, "lon": 2.3522},
    "76": {"name": "Seine-Maritime", "region": "normandie", "pref": "Rouen", "lat": 49.4431, "lon": 1.0993},
    "77": {"name": "Seine-et-Marne", "region": "ile-de-france", "pref": "Melun", "lat": 48.5403, "lon": 2.6561},
    "78": {"name": "Yvelines", "region": "ile-de-france", "pref": "Versailles", "lat": 48.8049, "lon": 2.1203},
    "79": {"name": "Deux-Sèvres", "region": "naq", "pref": "Niort", "lat": 46.3258, "lon": -0.4600},
    "80": {"name": "Somme", "region": "hdf", "pref": "Amiens", "lat": 49.8942, "lon": 2.2958},
    "81": {"name": "Tarn", "region": "occitanie", "pref": "Albi", "lat": 43.9289, "lon": 2.1464},
    "82": {"name": "Tarn-et-Garonne", "region": "occitanie", "pref": "Montauban", "lat": 44.0175, "lon": 1.3547},
    "83": {"name": "Var", "region": "paca", "pref": "Toulon", "lat": 43.1242, "lon": 5.9285},
    "84": {"name": "Vaucluse", "region": "paca", "pref": "Avignon", "lat": 43.9492, "lon": 4.8056},
    "85": {"name": "Vendée", "region": "pdl", "pref": "La Roche-sur-Yon", "lat": 46.6703, "lon": -1.4264},
    "86": {"name": "Vienne", "region": "naq", "pref": "Poitiers", "lat": 46.5802, "lon": 0.3403},
    "87": {"name": "Haute-Vienne", "region": "naq", "pref": "Limoges", "lat": 45.8336, "lon": 1.2611},
    "88": {"name": "Vosges", "region": "grand-est", "pref": "Épinal", "lat": 48.1744, "lon": 6.4503},
    "89": {"name": "Yonne", "region": "bfc", "pref": "Auxerre", "lat": 47.7989, "lon": 3.5678},
    "90": {"name": "Territoire de Belfort", "region": "bfc", "pref": "Belfort", "lat": 47.6397, "lon": 6.8636},
    "91": {"name": "Essonne", "region": "ile-de-france", "pref": "Évry", "lat": 48.6319, "lon": 2.4419},
    "92": {"name": "Hauts-de-Seine", "region": "ile-de-france", "pref": "Nanterre", "lat": 48.8924, "lon": 2.2061},
    "93": {"name": "Seine-Saint-Denis", "region": "ile-de-france", "pref": "Bobigny", "lat": 48.9086, "lon": 2.4397},
    "94": {"name": "Val-de-Marne", "region": "ile-de-france", "pref": "Créteil", "lat": 48.7903, "lon": 2.4628},
    "95": {"name": "Val-d'Oise", "region": "ile-de-france", "pref": "Pontoise", "lat": 49.0514, "lon": 2.1017}
}

def load_vigiseuils():
    """Charge les seuils officiels de canicule et de vigilance depuis vigiseuils.json."""
    if os.path.exists(VIGISEUILS_PATH):
        try:
            with open(VIGISEUILS_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Erreur de lecture de {VIGISEUILS_PATH}: {e}")
    return {}

def fetch_openmeteo_data(dep_dict):
    """Télécharge les données de prévisions météo à 7 jours pour tous les départements en une seule requête groupée."""
    print("Téléchargement des données de prévisions Open-Meteo pour les 96 départements...")
    
    latitudes = [str(info["lat"]) for info in dep_dict.values()]
    longitudes = [str(info["lon"]) for info in dep_dict.values()]
    
    base_url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": ",".join(latitudes),
        "longitude": ",".join(longitudes),
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_gusts_10m_max,weather_code",
        "timezone": "Europe/Paris",
        "forecast_days": 7
    }
    
    query_string = urllib.parse.urlencode(params)
    full_url = f"{base_url}?{query_string}"
    
    req = urllib.request.Request(
        full_url, 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data if isinstance(data, list) else [data]
    except Exception as e:
        print(f"Erreur lors de la requête Open-Meteo: {e}")
        return []

def calculate_risks(forecast_list, vigiseuils_data):
    """Calcule les pourcentages de risques pour chaque département et chaque jour."""
    seuils_canicule = vigiseuils_data.get("seuils_canicule_officiels", {})
    
    trends = {}
    dep_keys = list(DEPARTEMENTS_CONFIG.keys())
    
    for idx, dep_code in enumerate(dep_keys):
        dep_info = DEPARTEMENTS_CONFIG[dep_code]
        forecast = forecast_list[idx]
        
        daily = forecast.get("daily", {})
        dates = daily.get("time", [])
        
        tmax_list = daily.get("temperature_2m_max", [])
        tmin_list = daily.get("temperature_2m_min", [])
        rain_list = daily.get("precipitation_sum", [])
        snow_list = daily.get("snowfall_sum", [])
        wind_list = daily.get("wind_gusts_10m_max", [])
        wmo_list = daily.get("weather_code", [])
        
        th_jour = 33
        th_nuit = 18
        if dep_code in seuils_canicule:
            th_jour = seuils_canicule[dep_code].get("jour", 33)
            th_nuit = seuils_canicule[dep_code].get("nuit", 18)
            
        trends[dep_code] = {
            "name": dep_info["name"],
            "prefecture": dep_info["pref"],
            "region": dep_info["region"],
            "lat": dep_info["lat"],
            "lon": dep_info["lon"],
            "thresholds": {
                "canicule_jour": th_jour,
                "canicule_nuit": th_nuit
            },
            "days": []
        }
        
        for d_idx in range(len(dates)):
            date_str = dates[d_idx]
            
            # 1. Risque VENT (Seuils standard : Jaune > 75, Orange > 100, Rouge > 130 km/h)
            wind_val = wind_list[d_idx] if d_idx < len(wind_list) and wind_list[d_idx] is not None else 0
            if wind_val < 50:
                vent_risk = 0
            elif wind_val < 75:
                vent_risk = int(10 + (wind_val - 50) * 1.2)
            elif wind_val < 100:
                vent_risk = int(40 + (wind_val - 75) * 1.6)
            else:
                vent_risk = min(100, int(80 + (wind_val - 100) * 0.8))
                
            # 2. Risque PLUIE (Seuils : Jaune > 30mm/24h, Orange > 60mm/24h, Rouge > 100mm/24h)
            rain_val = rain_list[d_idx] if d_idx < len(rain_list) and rain_list[d_idx] is not None else 0
            if rain_val < 10:
                pluie_risk = 0
            elif rain_val < 30:
                pluie_risk = int((rain_val - 10) * 2)
            elif rain_val < 60:
                pluie_risk = int(40 + (rain_val - 30) * 1.3)
            else:
                pluie_risk = min(100, int(80 + (rain_val - 60) * 0.5))
                
            # 3. Risque NEIGE (Seuils : Jaune > 1cm, Orange > 5cm, Rouge > 15cm)
            snow_val = snow_list[d_idx] if d_idx < len(snow_list) and snow_list[d_idx] is not None else 0
            if snow_val <= 0.2:
                neige_risk = 0
            elif snow_val < 2:
                neige_risk = int(snow_val * 20)
            elif snow_val < 5:
                neige_risk = int(40 + (snow_val - 2) * 10)
            else:
                neige_risk = min(100, int(70 + (snow_val - 5) * 3))
                
            # 4. Risque CANICULE (Calcul sur moyenne glissante de 3 jours)
            tmax_avg, tmin_avg = 0, 0
            count = 0
            for shift in range(3):
                curr_d = d_idx + shift
                if curr_d < len(tmax_list) and tmax_list[curr_d] is not None and tmin_list[curr_d] is not None:
                    tmax_avg += tmax_list[curr_d]
                    tmin_avg += tmin_list[curr_d]
                    count += 1
            if count > 0:
                tmax_avg /= count
                tmin_avg /= count
            else:
                tmax_avg = tmax_list[d_idx] if d_idx < len(tmax_list) else 0
                tmin_avg = tmin_list[d_idx] if d_idx < len(tmin_list) else 0
                
            diff_jour = tmax_avg - th_jour
            diff_nuit = tmin_avg - th_nuit
            
            if diff_jour < -5 or diff_nuit < -4:
                canicule_risk = 0
            else:
                score_jour = max(0, min(100, int((diff_jour + 5) * 10)))
                score_nuit = max(0, min(100, int((diff_nuit + 4) * 12)))
                canicule_risk = int((score_jour + score_nuit) / 2)
                
            # 5. Risque GRAND FROID
            tmin_val = tmin_list[d_idx] if d_idx < len(tmin_list) and tmin_list[d_idx] is not None else 0
            if tmin_val > 5:
                froid_risk = 0
            elif tmin_val > 0:
                froid_risk = int((5 - tmin_val) * 6)
            elif tmin_val > -5:
                froid_risk = int(30 + (0 - tmin_val) * 10)
            else:
                froid_risk = min(100, int(80 + (-5 - tmin_val) * 4))
                
            # 6. Risque ORAGES
            wmo_code = wmo_list[d_idx] if d_idx < len(wmo_list) and wmo_list[d_idx] is not None else 0
            orage_risk = 0
            if wmo_code in (95, 96, 99):
                orage_risk = 90 if wmo_code in (96, 99) else 75
            elif wmo_code in (80, 81, 82) and rain_val > 5:
                orage_risk = 45
            elif rain_val > 15:
                orage_risk = 30
                
            trends[dep_code]["days"].append({
                "date": date_str,
                "values": {
                    "tmax": round(tmax_list[d_idx], 1) if d_idx < len(tmax_list) and tmax_list[d_idx] is not None else None,
                    "tmin": round(tmin_list[d_idx], 1) if d_idx < len(tmin_list) and tmin_list[d_idx] is not None else None,
                    "rain": round(rain_val, 1),
                    "snow": round(snow_val, 1),
                    "wind": round(wind_val, 1),
                    "wmo": wmo_code
                },
                "risks": {
                    "vent": vent_risk,
                    "pluie": pluie_risk,
                    "neige": neige_risk,
                    "canicule": canicule_risk,
                    "froid": froid_risk,
                    "orage": orage_risk
                }
            })
            
    return trends

def main():
    print("=== DÉBUT GÉNÉRATION TENDANCES RÉGIONALES ===")
    
    vigiseuils_data = load_vigiseuils()
    forecasts = fetch_openmeteo_data(DEPARTEMENTS_CONFIG)
    
    if not forecasts or len(forecasts) < len(DEPARTEMENTS_CONFIG):
        print("Erreur : Données météo manquantes ou incomplètes.")
        return
        
    trends = calculate_risks(forecasts, vigiseuils_data)
    
    regional_summary = {}
    for r_id, r_name in REGIONS_INFO.items():
        regional_summary[r_id] = {
            "name": r_name,
            "days": []
        }
        
    sample_dep = list(trends.keys())[0]
    dates = [d["date"] for d in trends[sample_dep]["days"]]
    
    for date_str in dates:
        for r_id in REGIONS_INFO.keys():
            deps_in_region = [dep_code for dep_code, info in DEPARTEMENTS_CONFIG.items() if info["region"] == r_id]
            
            day_vent_risks = []
            day_pluie_risks = []
            day_neige_risks = []
            day_canicule_risks = []
            day_froid_risks = []
            day_orage_risks = []
            
            for dep_code in deps_in_region:
                day_data = next(d for d in trends[dep_code]["days"] if d["date"] == date_str)
                rks = day_data["risks"]
                day_vent_risks.append(rks["vent"])
                day_pluie_risks.append(rks["pluie"])
                day_neige_risks.append(rks["neige"])
                day_canicule_risks.append(rks["canicule"])
                day_froid_risks.append(rks["froid"])
                day_orage_risks.append(rks["orage"])
                
            max_vent = max(day_vent_risks) if day_vent_risks else 0
            max_pluie = max(day_pluie_risks) if day_pluie_risks else 0
            max_neige = max(day_neige_risks) if day_neige_risks else 0
            max_canicule = max(day_canicule_risks) if day_canicule_risks else 0
            max_froid = max(day_froid_risks) if day_froid_risks else 0
            max_orage = max(day_orage_risks) if day_orage_risks else 0
            
            max_global = max(max_vent, max_pluie, max_neige, max_canicule, max_froid, max_orage)
            
            regional_summary[r_id]["days"].append({
                "date": date_str,
                "risks": {
                    "vent": max_vent,
                    "pluie": max_pluie,
                    "neige": max_neige,
                    "canicule": max_canicule,
                    "froid": max_froid,
                    "orage": max_orage,
                    "global": max_global
                }
            })
            
    output_payload = {
        "generated_at": datetime.now().isoformat(),
        "regions": regional_summary,
        "departements": trends
    }
    
    output_file = os.path.join(OUTPUT_DIR, "regional_trends.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, indent=2, ensure_ascii=False)
        
    print(f"Sauvegarde réussie dans {output_file}")
    print("=== FIN GÉNÉRATION TENDANCES RÉGIONALES ===")

if __name__ == "__main__":
    main()
