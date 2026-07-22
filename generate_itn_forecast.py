import os
import json
import urllib.request
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import numpy as np

# 30 stations de référence de l'Indicateur Thermique National (Météo-France)
STATIONS_ITN = [
    { "name": "Abbeville", "lat": 50.136, "lon": 1.834 },
    { "name": "Bâle-Mulhouse", "lat": 47.614, "lon": 7.510 },
    { "name": "Bordeaux-Mérignac", "lat": 44.831, "lon": -0.691 },
    { "name": "Boulogne-sur-Mer", "lat": 50.726, "lon": 1.614 },
    { "name": "Bourges", "lat": 47.059, "lon": 2.371 },
    { "name": "Bourg-Saint-Maurice", "lat": 45.618, "lon": 6.769 },
    { "name": "Brest-Guipavas", "lat": 48.444, "lon": -4.412 },
    { "name": "Caen-Carpiquet", "lat": 49.180, "lon": -0.456 },
    { "name": "Clermont-Ferrand", "lat": 45.786, "lon": 3.165 },
    { "name": "Dijon-Longvic", "lat": 47.268, "lon": 5.088 },
    { "name": "Le Luc", "lat": 43.382, "lon": 6.385 },
    { "name": "Lille-Lesquin", "lat": 50.570, "lon": 3.098 },
    { "name": "Limoges-Bellegarde", "lat": 45.861, "lon": 1.179 },
    { "name": "Lyon-Saint-Exupéry", "lat": 45.726, "lon": 5.078 },
    { "name": "Marseille-Marignane", "lat": 43.435, "lon": 5.214 },
    { "name": "Montpellier-Fréjorgues", "lat": 43.576, "lon": 3.963 },
    { "name": "Nancy-Essey", "lat": 48.690, "lon": 6.223 },
    { "name": "Nantes-Atlantique", "lat": 47.153, "lon": -1.608 },
    { "name": "Nice-Côte d'Azur", "lat": 43.658, "lon": 7.215 },
    { "name": "Nîmes-Garons", "lat": 43.757, "lon": 4.416 },
    { "name": "Orléans-Bricy", "lat": 47.989, "lon": 1.760 },
    { "name": "Paris-Montsouris", "lat": 48.822, "lon": 2.337 },
    { "name": "Perpignan-Rivesaltes", "lat": 42.737, "lon": 2.873 },
    { "name": "Poitiers-Biard", "lat": 46.588, "lon": 0.307 },
    { "name": "Reims-Prunay", "lat": 49.208, "lon": 4.048 },
    { "name": "Rennes-Saint-Jacques", "lat": 48.068, "lon": -1.734 },
    { "name": "Strasbourg-Entzheim", "lat": 48.542, "lon": 7.628 },
    { "name": "Tarbes-Ossun", "lat": 43.181, "lon": 0.003 },
    { "name": "Toulouse-Blagnac", "lat": 43.629, "lon": 1.364 },
    { "name": "Tours-Val de Loire", "lat": 47.432, "lon": 0.727 }
]

PROJECT_DIR = r"C:\Users\grego\Documents\METEO_CLIMAT\meteo cnews 2"
DEST_DIR = r"C:\Users\grego\Desktop\cartes_alertes"

def get_doy_index(dt):
    """Calcule l'index du jour de l'année basé sur un calendrier de 366 jours (année bissextile de référence 2020)"""
    dt_2020 = datetime(2020, dt.month, dt.day)
    return dt_2020.timetuple().tm_yday - 1

def fetch_itn_forecast():
    """Récupère les prévisions Météo-France (token mfsession) pour les 30 stations de l'ITN.
    Réutilise le même mécanisme d'authentification que generate_meteofrance_maps.py."""
    import sys, re, urllib.parse, time
    
    # --- Token Météo-France (identique aux bulletins vidéo) ---
    def rot13(s):
        res = []
        for c in s:
            if 'a' <= c <= 'z':
                res.append(chr((ord(c) - ord('a') + 13) % 26 + ord('a')))
            elif 'A' <= c <= 'Z':
                res.append(chr((ord(c) - ord('A') + 13) % 26 + ord('A')))
            else:
                res.append(c)
        return "".join(res)

    def get_token():
        print("Connexion à Météo-France pour récupérer le token de session (ITN)...")
        req = urllib.request.Request(
            "https://vigilance.meteofrance.fr/fr",
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        )
        mfsession = None
        try:
            with urllib.request.urlopen(req) as resp:
                for header, value in resp.getheaders():
                    if header.lower() == 'set-cookie' and 'mfsession=' in value:
                        m = re.search(r'mfsession=([^;]+)', value)
                        if m:
                            mfsession = m.group(1)
                            break
        except Exception as e:
            print(f"Erreur récupération token MF: {e}")
            return None
        if not mfsession:
            print("Token mfsession introuvable.")
            return None
        return rot13(urllib.parse.unquote(mfsession))

    def fetch_station(token, lat, lon):
        cb = int(time.time() * 1000)
        url = f"https://rwg.meteofrance.com/internet2018client/2.0/forecast?lat={lat}&lon={lon}&token={token}&_={cb}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read().decode('utf-8'))
        except Exception as e:
            print(f"  Erreur station lat={lat},lon={lon}: {e}")
            return None

    # --- Récupération du token ---
    token = get_token()
    if not token:
        raise RuntimeError("Impossible d'obtenir le token Météo-France. Abandon.")

    print(f"Récupération des prévisions MF pour les 30 stations ITN...")
    locations_data = []
    for station in STATIONS_ITN:
        raw = fetch_station(token, station["lat"], station["lon"])
        if raw is None:
            locations_data.append(None)
            continue
        # Normaliser au format attendu par compute_indicators
        daily_forecasts = raw.get("properties", {}).get("daily_forecast", [])
        times = [d["time"][:10] for d in daily_forecasts]
        tmin  = [d.get("T_min") for d in daily_forecasts]
        tmax  = [d.get("T_max") for d in daily_forecasts]
        locations_data.append({
            "daily": {
                "time": times,
                "temperature_2m_min": tmin,
                "temperature_2m_max": tmax,
            }
        })
    
    # Vérifier qu'au moins une station a répondu
    valid = [d for d in locations_data if d is not None]
    if not valid:
        raise RuntimeError("Aucune donnée MF reçue pour les 30 stations ITN.")
    print(f"  {len(valid)}/30 stations récupérées avec succès.")
    
    # Remplacer les stations None par la première valeur valide (fallback gracieux)
    ref = valid[0]
    return [d if d is not None else ref for d in locations_data]


def fetch_infoclimat_data():
    """Récupère les observations de l'année en cours (2026) sur Infoclimat"""
    url = "https://www.infoclimat.fr/climato/indicateur_national_xhr.php?years[]=2026&normes=1991-2020&indic=mf"
    req = urllib.request.Request(
        url, 
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.infoclimat.fr/climato/indicateur_national.php'
        }
    )
    try:
        print("Fetching 2026 observed data from Infoclimat...")
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Warning: Could not fetch observed data from Infoclimat: {e}")
        return None

def compute_indicators(forecasts, normals):
    """Calcule l'Indicateur Thermique National prévu et le compare aux normales"""
    dates_str = forecasts[0]["daily"]["time"]
    dates = [datetime.strptime(d, "%Y-%m-%d") for d in dates_str]
    
    days_count = len(dates)
    itn_forecast = []
    
    for d_idx in range(days_count):
        current_date = dates[d_idx]
        doy_idx = get_doy_index(current_date)
        
        tmin_list = []
        tmax_list = []
        tmean_list = []
        
        for loc_idx, loc in enumerate(STATIONS_ITN):
            loc_forecast = forecasts[loc_idx]["daily"]
            tmin = loc_forecast["temperature_2m_min"][d_idx]
            tmax = loc_forecast["temperature_2m_max"][d_idx]
            
            if tmin is not None and tmax is not None:
                tmin_list.append(tmin)
                tmax_list.append(tmax)
                tmean_list.append((tmin + tmax) / 2.0)
                
        avg_tmin = sum(tmin_list) / len(tmin_list) if tmin_list else 0.0
        avg_tmax = sum(tmax_list) / len(tmax_list) if tmax_list else 0.0
        avg_tmean = sum(tmean_list) / len(tmean_list) if tmean_list else 0.0
        
        norm_tm = normals["tml"][doy_idx][1] if doy_idx < len(normals["tml"]) else 0.0
        norm_tn = normals["tnl"][doy_idx][1] if doy_idx < len(normals["tnl"]) else 0.0
        norm_tx = normals["txl"][doy_idx][1] if doy_idx < len(normals["txl"]) else 0.0
        
        itn_forecast.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "formatted_date": current_date.strftime("%d/%m"),
            "display_date": current_date.strftime("%A %d %B").capitalize(),
            "tm": round(avg_tmean, 2),
            "tn": round(avg_tmin, 2),
            "tx": round(avg_tmax, 2),
            "norm_tm": round(norm_tm, 2),
            "norm_tn": round(norm_tn, 2),
            "norm_tx": round(norm_tx, 2),
            "anomaly_tm": round(avg_tmean - norm_tm, 2),
            "anomaly_tn": round(avg_tmin - norm_tn, 2),
            "anomaly_tx": round(avg_tmax - norm_tx, 2)
        })
        
    return itn_forecast

def generate_matplotlib_chart(itn_data):
    """Génère le graphique de zoom prévisions à 14 jours (PNG)"""
    dates = [datetime.strptime(d["date"], "%Y-%m-%d") for d in itn_data]
    tm_forecast = [d["tm"] for d in itn_data]
    tm_normal = [d["norm_tm"] for d in itn_data]
    
    bg_color = "#0f172a"
    card_color = "#1e293b"
    text_color = "#f8fafc"
    grid_color = "#334155"
    
    forecast_color = "#06b6d4"
    normal_color = "#94a3b8"
    
    fig, ax = plt.subplots(figsize=(12, 7.5), facecolor=bg_color)
    ax.set_facecolor(card_color)
    
    line_normal = ax.plot(dates, tm_normal, color=normal_color, linestyle="--", linewidth=2, label="Normale saisonnière (1991-2020)")
    line_forecast = ax.plot(dates, tm_forecast, color=forecast_color, linestyle="-", linewidth=3.5, marker="o", markersize=6, label="Indicateur Thermique prévu")
    
    for i in range(len(dates) - 1):
        x_seg = dates[i:i+2]
        y_fc_seg = tm_forecast[i:i+2]
        y_norm_seg = tm_normal[i:i+2]
        
        is_above = y_fc_seg[0] >= y_norm_seg[0]
        fill_color = "#ef4444" if is_above else "#3b82f6"
        fill_alpha = 0.20 if is_above else 0.15
        
        ax.fill_between(x_seg, y_fc_seg, y_norm_seg, color=fill_color, alpha=fill_alpha)

    for i, txt in enumerate(tm_forecast):
        offset = 0.4 if tm_forecast[i] >= tm_normal[i] else -0.6
        ax.text(dates[i], tm_forecast[i] + offset, f"{txt}°C", color="#ffffff", 
                fontsize=9.5, fontweight="bold", ha="center",
                bbox=dict(boxstyle="round,pad=0.2", facecolor=bg_color, edgecolor=forecast_color, alpha=0.8, lw=0.5))

    ax.xaxis.set_major_formatter(mdates.DateFormatter("%d %b", tz=None))
    ax.xaxis.set_major_locator(mdates.DayLocator(interval=1))
    
    plt.xticks(rotation=30, color="#cbd5e1", fontsize=10.5)
    plt.yticks(color="#cbd5e1", fontsize=10.5)
    
    ax.grid(True, which='both', linestyle=':', color=grid_color, alpha=0.7)
    for spine in ax.spines.values():
        spine.set_color(grid_color)
        spine.set_linewidth(1)
        
    plt.title("Prévision de l'Indicateur Thermique National", color=text_color, fontsize=18, fontweight="bold", pad=25)
    ax.text(0.5, 1.025, f"Comparaison aux normales climatologiques quotidiennes — Prévisions à 14 jours du {dates[0].strftime('%d/%m/%Y')} au {dates[-1].strftime('%d/%m/%Y')}", 
            color="#94a3b8", fontsize=11, transform=ax.transAxes, ha="center")
            
    legend = ax.legend(facecolor=bg_color, edgecolor=grid_color, labelcolor=text_color, loc="upper left", fontsize=11, framealpha=0.9, borderpad=0.8)
    for text in legend.get_texts():
        text.set_weight("semibold")
        
    plt.tight_layout()
    img_path = os.path.join(DEST_DIR, "indicateur_thermique_national.png")
    plt.savefig(img_path, dpi=200, facecolor=bg_color)
    plt.close()
    print(f"Beautiful zoom PNG chart saved successfully to {img_path}!")

def generate_matplotlib_annual_chart(tm_2026, tm_normal):
    """Génère le graphique de suivi annuel complet (PNG)"""
    bg_color = "#0f172a"
    card_color = "#1e293b"
    text_color = "#f8fafc"
    grid_color = "#334155"
    
    forecast_color = "#06b6d4"
    normal_color = "#94a3b8"
    
    fig, ax = plt.subplots(figsize=(15, 8.5), facecolor=bg_color)
    ax.set_facecolor(card_color)
    
    base_date = datetime(2020, 1, 1)
    dates = [base_date + timedelta(days=i) for i in range(366)]
    
    # Rendre les listes sous forme de tableaux NumPy pour le masque de données manquantes (NaN)
    y_normal = np.array(tm_normal, dtype=float)
    y_2026 = np.array(tm_2026, dtype=float)
    
    # Tracé des courbes
    ax.plot(dates, y_normal, color=normal_color, linestyle="--", linewidth=1.8, label="Normale saisonnière (1991-2020)")
    ax.plot(dates, y_2026, color=forecast_color, linestyle="-", linewidth=2.8, label="Indicateur National 2026 (Obs + Prév)")
    
    # Remplissage des anomalies
    mask = ~np.isnan(y_2026)
    ax.fill_between(dates, y_2026, y_normal, where=(y_2026 >= y_normal) & mask, interpolate=True, color="#ef4444", alpha=0.22, label="Anomalie positive")
    ax.fill_between(dates, y_2026, y_normal, where=(y_2026 < y_normal) & mask, interpolate=True, color="#3b82f6", alpha=0.18, label="Anomalie négative")
    
    # Axe X : placement manuel des graduations au début de chaque mois
    month_indices = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335]
    month_names = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
    ax.set_xticks([dates[i] for i in month_indices])
    ax.set_xticklabels(month_names, color="#cbd5e1", fontsize=10.5)
    
    plt.yticks(color="#cbd5e1", fontsize=10.5)
    ax.grid(True, which='both', linestyle=':', color=grid_color, alpha=0.6)
    
    for spine in ax.spines.values():
        spine.set_color(grid_color)
        spine.set_linewidth(1)
        
    plt.title("Suivi Annuel de l'Indicateur Thermique National 2026", color=text_color, fontsize=18, fontweight="bold", pad=25)
    ax.text(0.5, 1.025, "Comparaison de l'année 2026 (Observations + Prévisions à 14 jours) par rapport aux normales climatologiques 1991-2020", 
            color="#94a3b8", fontsize=11, transform=ax.transAxes, ha="center")
            
    legend = ax.legend(facecolor=bg_color, edgecolor=grid_color, labelcolor=text_color, loc="upper left", fontsize=11, framealpha=0.9, borderpad=0.8)
    for text in legend.get_texts():
        text.set_weight("semibold")
        
    plt.tight_layout()
    img_path = os.path.join(DEST_DIR, "indicateur_thermique_national_annuel.png")
    plt.savefig(img_path, dpi=200, facecolor=bg_color)
    plt.close()
    print(f"Beautiful annual PNG chart saved successfully to {img_path}!")

def generate_html_dashboard(itn_data, tm_2026_full, tn_2026_full, tx_2026_full, tm_normal_full):
    """Génère la page web HTML interactive et ultra-premium (suivi complet annuel avec Highcharts)"""
    anomalies_forecast = [d["anomaly_tm"] for d in itn_data]
    avg_anomaly_fc = sum(anomalies_forecast) / len(anomalies_forecast)
    max_forecast = max(d["tm"] for d in itn_data)
    min_forecast = min(d["tm"] for d in itn_data)
    
    anomaly_sign = "+" if avg_anomaly_fc >= 0 else ""
    anomaly_text = f"{anomaly_sign}{avg_anomaly_fc:.2f}°C"
    
    # 1. Tableau des prévisions à 14 jours
    table_rows_html = ""
    for d in itn_data:
        anom = d["anomaly_tm"]
        anom_style = "color: #f87171; font-weight: 600;" if anom >= 0 else "color: #60a5fa; font-weight: 600;"
        anom_sign = "+" if anom >= 0 else ""
        
        table_rows_html += f"""
        <tr style="border-bottom: 1px solid #334155; transition: background-color 0.2s;">
            <td style="padding: 14px 16px; color: #f8fafc; font-weight: 500;">{d["display_date"]}</td>
            <td style="padding: 14px 16px; color: #38bdf8; text-align: center; font-weight: 700; font-size: 1.05rem;">{d["tm"]}°C</td>
            <td style="padding: 14px 16px; color: #94a3b8; text-align: center;">{d["norm_tm"]}°C</td>
            <td style="padding: 14px 16px; text-align: center; {anom_style}">{anom_sign}{anom}°C</td>
            <td style="padding: 14px 16px; color: #cbd5e1; text-align: center;">{d["tn"]}°C / {d["tx"]}°C</td>
        </tr>
        """

    # 2. Préparation des axes temporels pour Highcharts (366 jours)
    base_date = datetime(2020, 1, 1)
    categories = []
    for i in range(366):
        dt = base_date + timedelta(days=i)
        categories.append(dt.strftime("%d/%m"))
        
    # Remplacer les valeurs NaN de Python par null pour le JSON Highcharts
    tm_2026_json = [None if np.isnan(v) or v is None else v for v in tm_2026_full]
    tn_2026_json = [None if np.isnan(v) or v is None else v for v in tn_2026_full]
    tx_2026_json = [None if np.isnan(v) or v is None else v for v in tx_2026_full]
    tm_normal_json = [round(v, 2) for v in tm_normal_full]
    
    # Identifier l'index de départ du zoom (aujourd'hui - 10 jours)
    today_idx = get_doy_index(datetime.now())
    zoom_start_idx = max(0, today_idx - 10)
    zoom_end_idx = min(365, today_idx + 14)
    
    html_content = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Suivi Annuel - Indicateur Thermique National</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/arearange.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Outfit', sans-serif;
            -webkit-font-smoothing: antialiased;
        }}
        
        body {{
            background: radial-gradient(circle at top right, #1e1b4b 0%, #0f172a 60%, #020617 100%);
            color: #f8fafc;
            min-height: 100vh;
            padding: 2.5rem 1.5rem;
            line-height: 1.5;
        }}
        
        .container {{
            max-width: 1280px;
            margin: 0 auto;
        }}
        
        header {{
            margin-bottom: 2.5rem;
            text-align: center;
        }}
        
        h1 {{
            font-size: 2.75rem;
            font-weight: 800;
            background: linear-gradient(135deg, #38bdf8 0%, #06b6d4 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
            letter-spacing: -0.025em;
        }}
        
        .subtitle {{
            color: #94a3b8;
            font-size: 1.15rem;
            font-weight: 400;
        }}
        
        .dashboard-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2.5rem;
        }}
        
        .kpi-card {{
            background: rgba(30, 41, 59, 0.45);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 1.5rem;
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
            transition: transform 0.3s ease, border-color 0.3s ease;
        }}
        
        .kpi-card:hover {{
            transform: translateY(-4px);
            border-color: rgba(56, 189, 248, 0.3);
        }}
        
        .kpi-label {{
            color: #94a3b8;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }}
        
        .kpi-value {{
            font-size: 2.25rem;
            font-weight: 800;
            color: #ffffff;
            line-height: 1.2;
        }}
        
        .kpi-desc {{
            color: #64748b;
            font-size: 0.85rem;
            margin-top: 0.5rem;
        }}
        
        .chart-container {{
            background: rgba(30, 41, 59, 0.45);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 2rem;
            margin-bottom: 2.5rem;
            box-shadow: 0 20px 45px -15px rgba(0, 0, 0, 0.6);
        }}
        
        #chart-div {{
            height: 540px;
            width: 100%;
        }}
        
        .chart-controls {{
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }}
        
        .btn {{
            background: rgba(51, 65, 85, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #cbd5e1;
            padding: 8px 16px;
            border-radius: 10px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }}
        
        .btn:hover {{
            background: #0284c7;
            color: #ffffff;
            border-color: #38bdf8;
        }}
        
        .btn.active {{
            background: #0284c7;
            color: #ffffff;
            border-color: #38bdf8;
            box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
        }}
        
        .table-section-title {{
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }}
        
        .table-container {{
            background: rgba(30, 41, 59, 0.3);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.5);
            margin-bottom: 2rem;
        }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }}
        
        th {{
            background: rgba(15, 23, 42, 0.6);
            padding: 16px;
            color: #94a3b8;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 600;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }}
        
        tr:hover td {{
            background: rgba(56, 189, 248, 0.04);
        }}
        
        .footer {{
            margin-top: 3rem;
            text-align: center;
            color: #475569;
            font-size: 0.9rem;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>INDICATEUR THERMIQUE NATIONAL 2026</h1>
            <p class="subtitle">Observations réelles & Prévisions quotidiennes face aux normales (période 1991-2020)</p>
            <p style="color: #64748b; font-size: 0.9rem; margin-top: 0.25rem;">Suivi complet de l'année — Basé sur 30 stations synoptiques de Météo-France</p>
        </header>
        
        <div class="dashboard-grid">
            <div class="kpi-card">
                <div class="kpi-label">Écart aux normales (14j)</div>
                <div class="kpi-value" style="color: { '#f87171' if avg_anomaly_fc >= 0 else '#60a5fa' };">
                    {anomaly_text}
                </div>
                <div class="kpi-desc">Écart moyen aux normales prévu pour la période de prévisions</div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-label">Max prévu (14j)</div>
                <div class="kpi-value" style="color: #fb923c;">
                    {max_forecast}°C
                </div>
                <div class="kpi-desc">Température nationale moyenne maximale sur la période de prévision</div>
            </div>
            
            <div class="kpi-card">
                <div class="kpi-label">Min prévu (14j)</div>
                <div class="kpi-value" style="color: #38bdf8;">
                    {min_forecast}°C
                </div>
                <div class="kpi-desc">Température nationale moyenne minimale sur la période de prévision</div>
            </div>
        </div>
        
        <div class="chart-container">
            <div class="chart-controls">
                <button class="btn" id="btn-zoom">Zoom Prévisions</button>
                <button class="btn active" id="btn-full">Année Complète</button>
            </div>
            <div id="chart-div"></div>
        </div>
        
        <div class="table-section-title">
            <span>📅 Focus Prévisions : Prochains 14 Jours</span>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th style="padding: 16px;">Date</th>
                        <th style="padding: 16px; text-align: center;">Indicateur prévu</th>
                        <th style="padding: 16px; text-align: center;">Normale (1991-2020)</th>
                        <th style="padding: 16px; text-align: center;">Anomalie</th>
                        <th style="padding: 16px; text-align: center;">Min / Max prévus</th>
                    </tr>
                </thead>
                <tbody>
                    {table_rows_html}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            Météo Climat Pro © 2026 — Données de prévision fournies par Open-Meteo & Observations / Normales extraites d'Infoclimat.
        </div>
    </div>

    <script>
        const categories = {json.dumps(categories)};
        const tm2026 = {json.dumps(tm_2026_json)};
        const tmNormal = {json.dumps(tm_normal_json)};
        const tn2026 = {json.dumps(tn_2026_json)};
        const tx2026 = {json.dumps(tx_2026_json)};
        
        const anomalyRangeAbove = [];
        const anomalyRangeBelow = [];
        
        for (let i = 0; i < 366; i++) {{
            const fc = tm2026[i];
            const norm = tmNormal[i];
            if (fc === null || fc === undefined) {{
                anomalyRangeAbove.push([i, null, null]);
                anomalyRangeBelow.push([i, null, null]);
            }} else if (fc >= norm) {{
                anomalyRangeAbove.push([i, norm, fc]);
                anomalyRangeBelow.push([i, null, null]);
            }} else {{
                anomalyRangeAbove.push([i, null, null]);
                anomalyRangeBelow.push([i, fc, norm]);
            }}
        }}

        const chart = Highcharts.chart('chart-div', {{
            chart: {{
                backgroundColor: 'transparent',
                style: {{
                    fontFamily: "'Outfit', sans-serif"
                }},
                zoomType: 'xy'
            }},
            title: {{
                text: "Suivi Annuel de l'Indicateur Thermique National",
                align: 'left',
                style: {{
                    color: '#ffffff',
                    fontSize: '20px',
                    fontWeight: '700'
                }}
            }},
            subtitle: {{
                text: 'Données réelles cumulées face aux normales quotidiennes 1991-2020',
                align: 'left',
                style: {{
                    color: '#94a3b8',
                    fontSize: '14px'
                }}
            }},
            xAxis: {{
                categories: categories,
                gridLineColor: 'rgba(255, 255, 255, 0.05)',
                gridLineWidth: 1,
                labels: {{
                    style: {{
                        color: '#cbd5e1',
                        fontSize: '12px'
                    }}
                }},
                lineColor: 'rgba(255, 255, 255, 0.1)',
                tickColor: 'rgba(255, 255, 255, 0.1)'
            }},
            yAxis: {{
                title: {{
                    text: 'Température (°C)',
                    style: {{
                        color: '#94a3b8',
                        fontSize: '13px'
                    }}
                }},
                gridLineColor: 'rgba(255, 255, 255, 0.06)',
                labels: {{
                    style: {{
                        color: '#cbd5e1',
                        fontSize: '12px'
                    }}
                }}
            }},
            tooltip: {{
                shared: true,
                useHTML: true,
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                style: {{
                    color: '#f8fafc'
                }},
                headerFormat: '<span style="font-size: 11px; color: #94a3b8; font-weight: 500;">{{point.key}}</span><br/>',
                pointFormatter: function() {{
                    if (this.series.name.includes('Anomalie')) return '';
                    let val = this.y.toFixed(2);
                    return `<span style="color:${{this.color}}">\u25CF</span> ${{this.series.name}}: <b>${{val}}°C</b><br/>`;
                }}
            }},
            legend: {{
                itemStyle: {{
                    color: '#cbd5e1',
                    fontSize: '13px',
                    fontWeight: '500'
                }},
                itemHoverStyle: {{
                    color: '#ffffff'
                }}
            }},
            credits: {{
                enabled: false
            }},
            series: [
                {{
                    name: 'Indicateur Thermique 2026 (Tm)',
                    type: 'line',
                    data: tm2026,
                    color: '#06b6d4',
                    lineWidth: 3,
                    marker: {{
                        enabled: false,
                        radius: 4,
                        fillColor: '#0f172a',
                        lineWidth: 2,
                        lineColor: '#06b6d4'
                    }},
                    zIndex: 3
                }},
                {{
                    name: 'Normale Saisonnière',
                    type: 'line',
                    data: tmNormal,
                    color: '#94a3b8',
                    dashStyle: 'shortdash',
                    lineWidth: 2,
                    marker: {{
                        enabled: false
                    }},
                    zIndex: 2
                }},
                {{
                    name: 'Anomalie Positive',
                    type: 'arearange',
                    data: anomalyRangeAbove,
                    color: '#ef4444',
                    fillColor: 'rgba(239, 68, 68, 0.18)',
                    lineWidth: 0,
                    linkedTo: ':previous',
                    marker: {{
                        enabled: false
                    }},
                    zIndex: 1
                }},
                {{
                    name: 'Anomalie Négative',
                    type: 'arearange',
                    data: anomalyRangeBelow,
                    color: '#3b82f6',
                    fillColor: 'rgba(59, 130, 246, 0.14)',
                    lineWidth: 0,
                    linkedTo: ':previous',
                    marker: {{
                        enabled: false
                    }},
                    zIndex: 1
                }},
                {{
                    name: 'Minima 2026 (Tn)',
                    type: 'line',
                    data: tn2026,
                    color: '#38bdf8',
                    lineWidth: 1.5,
                    visible: false,
                    marker: {{
                        enabled: false
                    }}
                }},
                {{
                    name: 'Maxima 2026 (Tx)',
                    type: 'line',
                    data: tx2026,
                    color: '#fb923c',
                    lineWidth: 1.5,
                    visible: false,
                    marker: {{
                        enabled: false
                    }}
                }}
            ]
        }});

        // Boutons de contrôle du Zoom
        document.getElementById('btn-zoom').addEventListener('click', function() {{
            chart.xAxis[0].setExtremes({zoom_start_idx}, {zoom_end_idx});
            document.getElementById('btn-zoom').classList.add('active');
            document.getElementById('btn-full').classList.remove('active');
        }});
        
        document.getElementById('btn-full').addEventListener('click', function() {{
            chart.xAxis[0].setExtremes(null, null);
            document.getElementById('btn-zoom').classList.remove('active');
            document.getElementById('btn-full').classList.add('active');
        }});
    </script>
</body>
</html>
"""
    
    html_path = os.path.join(DEST_DIR, "indicateur_thermique.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Interactive HTML dashboard saved successfully to {html_path}!")

def create_sunset_background(width=1920, height=1080):
    from PIL import Image
    # Create small image for fast gradient computation (fallback)
    sw, sh = 480, 270
    img = Image.new("RGB", (sw, sh))
    pixels = img.load()
    
    # Glow center in small coordinates
    cx, cy = int(1800 * sw / width), int(100 * sh / height)
    
    # Left base color: dark reddish-orange (60, 27, 18) -> #3c1b12
    # Right base color: dark slate blue (15, 23, 42) -> #0f172a
    c_left = np.array([60, 27, 18])
    c_right = np.array([20, 28, 45])
    c_glow = np.array([255, 235, 180]) # Warm sun glow
    
    for y in range(sh):
        for x in range(sw):
            t = x / sw
            color = (1 - t) * c_left + t * c_right
            dx = x - cx
            dy = y - cy
            dist = np.sqrt(dx*dx + dy*dy)
            factor = np.exp(-dist / 50.0)
            final_color = color * (1 - factor) + c_glow * factor
            pixels[x, y] = tuple(np.clip(final_color, 0, 255).astype(int))
            
    return img.resize((width, height), Image.Resampling.LANCZOS)

def draw_vertical_text(image, text, position, font, color):
    from PIL import Image, ImageDraw
    txt_img = Image.new("RGBA", (400, 50), (0, 0, 0, 0))
    txt_draw = ImageDraw.Draw(txt_img)
    txt_draw.text((10, 10), text, fill=color, font=font)
    rotated = txt_img.rotate(90, expand=True)
    image.paste(rotated, position, rotated)

def get_font(font_type, size):
    from PIL import ImageFont
    try:
        if font_type == "bold":
            return ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", size)
        elif font_type == "narrow_bold":
            return ImageFont.truetype(r"C:\Windows\Fonts\ARIALNB.TTF", size)
        else:
            return ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", size)
    except IOError:
        return ImageFont.load_default()

def draw_logo_cnews(draw, x_start, y_start):
    # Capsule logo Météo-Climat Pro (+20% agrandi, style chaîne TV haut de gamme)
    draw.rounded_rectangle([x_start, y_start, x_start + 295, y_start + 95], radius=10, fill="#081d38", outline=(255, 255, 255, 60), width=1)
    font_logo_bold = get_font("bold", 28)
    draw.text((x_start + 18, y_start + 14), "MÉTÉO-CLIMAT", fill="white", font=font_logo_bold)
    draw.text((x_start + 18, y_start + 50), "PRO", fill="#fbbf24", font=font_logo_bold)

def get_french_date_range(d_start, d_end):
    MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
    if d_start.month == d_end.month:
        return f"du {d_start.day} au {d_end.day} {MONTHS_FR[d_start.month - 1]} {d_start.year}"
    else:
        return f"du {d_start.day} {MONTHS_FR[d_start.month - 1]} au {d_end.day} {MONTHS_FR[d_end.month - 1]} {d_start.year}"

def fmt_temp(v):
    s = f"{v:.1f}".replace(".", ",")
    if s.endswith(",0"): return s[:-2]
    return s

def generate_broadcast_tv_chart(itn_data):
    from PIL import Image, ImageDraw
    
    # Filtrer les données à partir du 22 juillet 2026
    itn_sub = [d for d in itn_data if d["date"] >= "2026-07-22"]
    if len(itn_sub) < 11:
        itn_sub = itn_data[:11]
    else:
        itn_sub = itn_sub[:11]
    
    width, height = 1920, 1080
    bg_dir = os.path.join(DEST_DIR, "A_CONSERVER_ABSOLUMENT")
    bg_path = os.path.join(bg_dir, "CARTE PAYSAGE METEOCIEL.png")
    if not os.path.exists(bg_path):
        bg_path = os.path.join(bg_dir, "ITN PAYSAGE.png")
    if not os.path.exists(bg_path):
        bg_path = os.path.join(PROJECT_DIR, "bg_landscape_itn_v2.png")
    
    if os.path.exists(bg_path):
        bg = Image.open(bg_path).convert("RGBA").resize((width, height), Image.Resampling.LANCZOS)
    else:
        bg = Image.new("RGBA", (width, height), (15, 23, 42, 255))
        
    # --- Voile bleu sombre renforcé (-15% visibilité fond) pour focaliser 100% l'attention sur les données ---
    bg_overlay = Image.new("RGBA", (width, height), (8, 14, 30, 205))
    bg = Image.alpha_composite(bg, bg_overlay)
    draw = ImageDraw.Draw(bg)
    
    # 1. Logo agrandi de +20%
    draw_logo_cnews(draw, 35, 35)
    
    # 2. Dynamic Title & Subtitle (CNews style)
    font_title = get_font("narrow_bold", 64)
    font_subtitle = get_font("narrow_bold", 40)
    
    dates = [datetime.strptime(d["date"], "%Y-%m-%d") for d in itn_sub]
    date_range_str = get_french_date_range(dates[0], dates[-1])
    
    # Titre en Jaune vif (#ffcc00), Sous-titre en gris très clair (#cbd5e1) pour hiérarchie visuelle parfaite
    draw.text((1880, 25), "INDICATEUR THERMIQUE NATIONAL", fill="#ffcc00", font=font_title, anchor="rt", stroke_width=4, stroke_fill="black")
    draw.text((1880, 98), f"ÉVOLUTION POUR LA PÉRIODE {date_range_str.upper()}", fill="#cbd5e1", font=font_subtitle, anchor="rt", stroke_width=3, stroke_fill="black")
    
    # 3. Coordonnées du graphique (remonté de 30px supplémentaires : bottom=780, top=280)
    left, right = 230, 1720
    bottom, top = 780, 280
    p_width = right - left
    p_height = bottom - top
    
    tm_forecast = [d["tm"] for d in itn_sub]
    tm_normal = [d["norm_tm"] for d in itn_sub]
    
    y_min_val = min(min(tm_forecast), min(tm_normal))
    y_max_val = max(max(tm_forecast), max(tm_normal))
    y_min = y_min_val - 1.5
    y_max = y_max_val + 2.2
    
    x_coords = [left + int(i * p_width / 10) for i in range(11)]
    y_fc = [int(bottom - (v - y_min) / (y_max - y_min) * p_height) for v in tm_forecast]
    y_norm = [int(bottom - (v - y_min) / (y_max - y_min) * p_height) for v in tm_normal]
    
    # 4. Remplissage des anomalies avec Dégradé Vertical 3D (soutenu vers la courbe, plus doux vers la normale)
    fill_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    f_draw = ImageDraw.Draw(fill_layer)
    
    for x in range(left, right + 1):
        for i in range(10):
            if x_coords[i] <= x <= x_coords[i+1]:
                t = (x - x_coords[i]) / (x_coords[i+1] - x_coords[i])
                y_f_x = y_fc[i] + t * (y_fc[i+1] - y_fc[i])
                y_n_x = y_norm[i] + t * (y_norm[i+1] - y_norm[i])
                
                y_top_px = min(int(y_f_x), int(y_n_x))
                y_bot_px = max(int(y_f_x), int(y_n_x))
                h_line = max(1, y_bot_px - y_top_px)
                
                is_positive = y_f_x < y_n_x
                
                for py in range(y_top_px, y_bot_px + 1):
                    rel_y = (py - y_top_px) / h_line
                    if is_positive:
                        alpha = int(250 - rel_y * 80)
                        f_draw.point((x, py), fill=(244, 91, 105, alpha))
                    else:
                        alpha = int(170 + rel_y * 80)
                        f_draw.point((x, py), fill=(59, 130, 246, alpha))
                break
                
    bg = Image.alpha_composite(bg, fill_layer)
    draw = ImageDraw.Draw(bg)
    
    # 5. Ligne de normale (épaisseur 8px, blanc cassé #f1f5f9) et courbe prévue (épaisseur 11px, blanc)
    for i in range(10):
        draw.line([x_coords[i], y_norm[i], x_coords[i+1], y_norm[i+1]], fill="#f1f5f9", width=8)
    for i in range(10):
        draw.line([x_coords[i], y_fc[i], x_coords[i+1], y_fc[i+1]], fill="white", width=11)
        
    # 6. Points de la courbe (diamètre 34px, +10% agrandis)
    for i in range(11):
        draw.ellipse([x_coords[i] - 17, y_fc[i] - 17, x_coords[i] + 17, y_fc[i] + 17], fill="white", outline="#0f172a", width=2)
        
    # Polices et espacements des valeurs numériques
    font_bold_34 = get_font("bold", 34)
    font_bold_28 = get_font("bold", 28)
    
    peak_idx = tm_forecast.index(max(tm_forecast))
    min_val = min(tm_forecast)
    min_idx = tm_forecast.index(min_val)
    
    for i in range(11):
        v_str = fmt_temp(tm_forecast[i])
        is_above = y_fc[i] <= y_norm[i]
        
        if i == peak_idx:
            text_w, text_h = 98, 50
            bx, by = x_coords[i], y_fc[i] - 66
            # Ombre portée discrète sous la pastille
            draw.rounded_rectangle([bx - text_w//2 + 3, by - text_h//2 + 4, bx + text_w//2 + 3, by + text_h//2 + 4], radius=8, fill=(0, 0, 0, 140))
            draw.rounded_rectangle([bx - text_w//2, by - text_h//2, bx + text_w//2, by + text_h//2], radius=8, fill="#f45b69", outline="white", width=2)
            draw.text((bx, by), v_str, fill="white", font=font_bold_34, anchor="mm")
        elif i == min_idx and not is_above:
            text_w, text_h = 98, 50
            bx, by = x_coords[i], y_fc[i] + 66
            # Ombre portée discrète sous la pastille
            draw.rounded_rectangle([bx - text_w//2 + 3, by - text_h//2 + 4, bx + text_w//2 + 3, by + text_h//2 + 4], radius=8, fill=(0, 0, 0, 140))
            draw.rounded_rectangle([bx - text_w//2, by - text_h//2, bx + text_w//2, by + text_h//2], radius=8, fill="#3b82f6", outline="white", width=2)
            draw.text((bx, by), v_str, fill="white", font=font_bold_34, anchor="mm")
        elif i == 10:
            box_color = "#3b82f6" if tm_forecast[10] <= 24.0 else "#f45b69"
            text_w, text_h = 98, 50
            bx, by = x_coords[i], y_fc[i] - 66
            # Ombre portée discrète sous la pastille
            draw.rounded_rectangle([bx - text_w//2 + 3, by - text_h//2 + 4, bx + text_w//2 + 3, by + text_h//2 + 4], radius=8, fill=(0, 0, 0, 140))
            draw.rounded_rectangle([bx - text_w//2, by - text_h//2, bx + text_w//2, by + text_h//2], radius=8, fill=box_color, outline="white", width=2)
            draw.text((bx, by), v_str, fill="white", font=font_bold_34, anchor="mm")
        else:
            bx = x_coords[i]
            if is_above:
                by = y_fc[i] - 50
                draw.text((bx, by), v_str, fill="white", font=font_bold_34, anchor="ms", stroke_width=3, stroke_fill="#090d16")
            else:
                by = y_fc[i] + 52
                draw.text((bx, by), v_str, fill="white", font=font_bold_34, anchor="mt", stroke_width=3, stroke_fill="#090d16")
            
    # Valeurs des normales aux extrémités
    draw.text((x_coords[0], y_norm[0] + 38), fmt_temp(tm_normal[0]), fill="#ffffff", font=font_bold_28, anchor="ms", stroke_width=3, stroke_fill="#090d16")
    draw.text((x_coords[10], y_norm[10] + 38), fmt_temp(tm_normal[10]), fill="#ffffff", font=font_bold_28, anchor="ms", stroke_width=3, stroke_fill="#090d16")
    
    # Axe X des jours
    WEEKDAYS_MAP = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."]
    for i in range(11):
        dt = dates[i]
        label = f"{WEEKDAYS_MAP[dt.weekday()]} {dt.day}"
        draw.text((x_coords[i], 865), label, fill="#ffffff", font=font_bold_28, anchor="ms", stroke_width=3, stroke_fill="#090d16")
        
    draw_vertical_text(bg, "Meteo Climat Pro", (1880, 720), get_font("bold", 24), (255, 255, 255, 180))
    
    out_path = os.path.join(DEST_DIR, "indicateur_thermique_tv.png")
    bg.convert("RGB").save(out_path, "PNG")
    print(f"Broadcast TV Landscape chart saved successfully to {out_path}!")
    
    try:
        desktop_dir = r"C:\Users\grego\Desktop"
        today_str = datetime.now().strftime("%Y_%m_%d")
        desktop_path = os.path.join(desktop_dir, f"indicateur_thermique_tv_{today_str}.png")
        bg.convert("RGB").save(desktop_path, "PNG")
        print(f"Desktop dated Landscape chart saved successfully to {desktop_path}!")
    except Exception as e:
        print(f"Warning: Could not save dated copy to Desktop: {e}")

def generate_broadcast_tiktok_chart(itn_data):
    from PIL import Image, ImageDraw
    
    # Filtrer les données à partir du 22 juillet 2026
    itn_sub = [d for d in itn_data if d["date"] >= "2026-07-22"]
    if len(itn_sub) < 11:
        itn_sub = itn_data[:11]
    else:
        itn_sub = itn_sub[:11]
    
    width, height = 1080, 1920
    bg_dir = os.path.join(DEST_DIR, "A_CONSERVER_ABSOLUMENT")
    bg_path = os.path.join(bg_dir, "CARTE PORTRAIT METEOCIEL.png")
    if not os.path.exists(bg_path):
        bg_path = os.path.join(bg_dir, "ITN TIKTOK.png")
    if not os.path.exists(bg_path):
        bg_path = os.path.join(PROJECT_DIR, "bg_portrait_itn_v2.png")
    
    if os.path.exists(bg_path):
        bg = Image.open(bg_path).convert("RGBA").resize((width, height), Image.Resampling.LANCZOS)
    else:
        bg = Image.new("RGBA", (width, height), (15, 23, 42, 255))
        
    # --- Voile bleu sombre renforcé TikTok ---
    bg_overlay = Image.new("RGBA", (width, height), (8, 14, 30, 205))
    bg = Image.alpha_composite(bg, bg_overlay)
    draw = ImageDraw.Draw(bg)
    
    # 1. Logo agrandi
    draw_logo_cnews(draw, 35, 45)
    
    # 2. Dynamic Title & Subtitle (TikTok Style)
    font_title = get_font("narrow_bold", 50)
    font_subtitle = get_font("narrow_bold", 32)
    
    dates = [datetime.strptime(d["date"], "%Y-%m-%d") for d in itn_sub]
    date_range_str = get_french_date_range(dates[0], dates[-1])
    
    draw.text((1040, 40), "INDICATEUR THERMIQUE NATIONAL", fill="#ffcc00", font=font_title, anchor="rt", stroke_width=4, stroke_fill="black")
    draw.text((1040, 95), f"ÉVOLUTION POUR LA PÉRIODE {date_range_str.upper()}", fill="#cbd5e1", font=font_subtitle, anchor="rt", stroke_width=3, stroke_fill="black")
    
    # 3. Coordonnées du graphique (remonté de 30px : bottom=1420, top=440)
    left, right = 110, 970
    bottom, top = 1420, 440
    p_width = right - left
    p_height = bottom - top
    
    tm_forecast = [d["tm"] for d in itn_sub]
    tm_normal = [d["norm_tm"] for d in itn_sub]
    
    y_min_val = min(min(tm_forecast), min(tm_normal))
    y_max_val = max(max(tm_forecast), max(tm_normal))
    y_min = y_min_val - 1.5
    y_max = y_max_val + 2.2
    
    x_coords = [left + int(i * p_width / 10) for i in range(11)]
    y_fc = [int(bottom - (v - y_min) / (y_max - y_min) * p_height) for v in tm_forecast]
    y_norm = [int(bottom - (v - y_min) / (y_max - y_min) * p_height) for v in tm_normal]
    
    # 4. Remplissage des anomalies avec Dégradé Vertical 3D
    fill_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    f_draw = ImageDraw.Draw(fill_layer)
    
    for x in range(left, right + 1):
        for i in range(10):
            if x_coords[i] <= x <= x_coords[i+1]:
                t = (x - x_coords[i]) / (x_coords[i+1] - x_coords[i])
                y_f_x = y_fc[i] + t * (y_fc[i+1] - y_fc[i])
                y_n_x = y_norm[i] + t * (y_norm[i+1] - y_norm[i])
                
                y_top_px = min(int(y_f_x), int(y_n_x))
                y_bot_px = max(int(y_f_x), int(y_n_x))
                h_line = max(1, y_bot_px - y_top_px)
                
                is_positive = y_f_x < y_n_x
                
                for py in range(y_top_px, y_bot_px + 1):
                    rel_y = (py - y_top_px) / h_line
                    if is_positive:
                        alpha = int(250 - rel_y * 80)
                        f_draw.point((x, py), fill=(244, 91, 105, alpha))
                    else:
                        alpha = int(170 + rel_y * 80)
                        f_draw.point((x, py), fill=(59, 130, 246, alpha))
                break
                
    bg = Image.alpha_composite(bg, fill_layer)
    draw = ImageDraw.Draw(bg)
    
    # 5. Lines
    for i in range(10):
        draw.line([x_coords[i], y_norm[i], x_coords[i+1], y_norm[i+1]], fill="#f1f5f9", width=7)
    for i in range(10):
        draw.line([x_coords[i], y_fc[i], x_coords[i+1], y_fc[i+1]], fill="white", width=10)
        
    # 6. Markers (diamètre 30px)
    for i in range(11):
        draw.ellipse([x_coords[i] - 15, y_fc[i] - 15, x_coords[i] + 15, y_fc[i] + 15], fill="white", outline="#0f172a", width=2)
        
    # Fonts
    font_bold_30 = get_font("bold", 30)
    font_bold_24 = get_font("bold", 24)
    
    peak_idx = tm_forecast.index(max(tm_forecast))
    min_val = min(tm_forecast)
    min_idx = tm_forecast.index(min_val)
    
    for i in range(11):
        v_str = fmt_temp(tm_forecast[i])
        is_above = y_fc[i] <= y_norm[i]
        
        if i == peak_idx:
            text_w, text_h = 90, 44
            bx, by = x_coords[i], y_fc[i] - 60
            # Ombre portée sous la pastille
            draw.rounded_rectangle([bx - text_w//2 + 3, by - text_h//2 + 4, bx + text_w//2 + 3, by + text_h//2 + 4], radius=8, fill=(0, 0, 0, 140))
            draw.rounded_rectangle([bx - text_w//2, by - text_h//2, bx + text_w//2, by + text_h//2], radius=8, fill="#f45b69", outline="white", width=2)
            draw.text((bx, by), v_str, fill="white", font=font_bold_30, anchor="mm")
        elif i == min_idx and not is_above:
            text_w, text_h = 90, 44
            bx, by = x_coords[i], y_fc[i] + 60
            # Ombre portée sous la pastille
            draw.rounded_rectangle([bx - text_w//2 + 3, by - text_h//2 + 4, bx + text_w//2 + 3, by + text_h//2 + 4], radius=8, fill=(0, 0, 0, 140))
            draw.rounded_rectangle([bx - text_w//2, by - text_h//2, bx + text_w//2, by + text_h//2], radius=8, fill="#3b82f6", outline="white", width=2)
            draw.text((bx, by), v_str, fill="white", font=font_bold_30, anchor="mm")
        elif i == 10:
            box_color = "#3b82f6" if tm_forecast[10] <= 24.0 else "#f45b69"
            text_w, text_h = 90, 44
            bx, by = x_coords[i], y_fc[i] - 60
            # Ombre portée sous la pastille
            draw.rounded_rectangle([bx - text_w//2 + 3, by - text_h//2 + 4, bx + text_w//2 + 3, by + text_h//2 + 4], radius=8, fill=(0, 0, 0, 140))
            draw.rounded_rectangle([bx - text_w//2, by - text_h//2, bx + text_w//2, by + text_h//2], radius=8, fill=box_color, outline="white", width=2)
            draw.text((bx, by), v_str, fill="white", font=font_bold_30, anchor="mm")
        else:
            bx = x_coords[i]
            if is_above:
                by = y_fc[i] - 46
                draw.text((bx, by), v_str, fill="white", font=font_bold_30, anchor="ms", stroke_width=3, stroke_fill="#090d16")
            else:
                by = y_fc[i] + 48
                draw.text((bx, by), v_str, fill="white", font=font_bold_30, anchor="mt", stroke_width=3, stroke_fill="#090d16")
                
    # Valeurs des normales aux extrémités
    draw.text((x_coords[0], y_norm[0] + 34), fmt_temp(tm_normal[0]), fill="#ffffff", font=font_bold_24, anchor="ms", stroke_width=3, stroke_fill="#090d16")
    draw.text((x_coords[10], y_norm[10] + 34), fmt_temp(tm_normal[10]), fill="#ffffff", font=font_bold_24, anchor="ms", stroke_width=3, stroke_fill="#090d16")
    
    # Axe X des jours
    WEEKDAYS_MAP = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."]
    for i in range(11):
        dt = dates[i]
        label = f"{WEEKDAYS_MAP[dt.weekday()]} {dt.day}"
        draw.text((x_coords[i], 1495), label, fill="#ffffff", font=font_bold_24, anchor="ms", stroke_width=3, stroke_fill="#090d16")
        
    draw_vertical_text(bg, "Meteo Climat Pro", (1040, 1340), get_font("bold", 22), (255, 255, 255, 180))
    
    out_path = os.path.join(DEST_DIR, "indicateur_thermique_tiktok.png")
    bg.convert("RGB").save(out_path, "PNG")
    print(f"Broadcast TikTok Portrait chart saved successfully to {out_path}!")

def generate_csv_export(tm_2026, tm_normal, itn_data):
    csv_path = r"C:\Users\grego\Desktop\indicateur_thermique_2026.csv"
    
    # Create forecast doy set for quick lookup
    forecast_doys = set()
    for d_data in itn_data:
        dt = datetime.strptime(d_data["date"], "%Y-%m-%d")
        forecast_doys.add(get_doy_index(dt))
        
    try:
        import csv
        with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.writer(f, delimiter=";")
            writer.writerow(["Date", "Indicateur 2026 (C)", "Normale 1991-2020 (C)", "Ecart (C)", "Statut"])
            
            base_date = datetime(2026, 1, 1)
            for i in range(365): # 2026 has 365 days
                dt = base_date + timedelta(days=i)
                doy = get_doy_index(dt)
                
                val = tm_2026[doy]
                norm = tm_normal[doy]
                
                val_is_valid = val is not None and not np.isnan(val)
                val_str = f"{val}".replace(".", ",") if val_is_valid else ""
                norm_str = f"{norm}".replace(".", ",")
                
                if val_is_valid:
                    ecart = round(val - norm, 2)
                    ecart_str = f"{ecart}".replace(".", ",")
                    
                    if doy in forecast_doys:
                        statut = "Prevision"
                    else:
                        statut = "Observation"
                else:
                    ecart_str = ""
                    statut = "Non mesure"
                    
                writer.writerow([dt.strftime("%d/%m/%Y"), val_str, norm_str, ecart_str, statut])
                
        print(f"CSV exported successfully to {csv_path}!")
    except OSError as e:
        print(f"Warning: Could not write CSV file to {csv_path} (it might be open in Excel or another program): {e}")

def generate_broadcast_itn_maps(itn_data, forecasts):
    """Génère les cartes ITN TV (Paysage) et TikTok (Portrait) sur fond Météociel intact."""
    import math
    from PIL import Image, ImageDraw, ImageFont

    if not itn_data or not forecasts:
        print("Warning: Missing itn_data or forecasts for map generation.")
        return

    today_itn = itn_data[0]
    display_date = today_itn["display_date"]
    tm_nat = today_itn["tm"]
    anom_nat = today_itn["anomaly_tm"]
    anom_sign = f"+{anom_nat:.1f}".replace(".", ",") if anom_nat >= 0 else f"{anom_nat:.1f}".replace(".", ",")
    tm_nat_str = f"{tm_nat:.1f}".replace(".", ",")

    def mercator_y(lat):
        rad = math.radians(lat)
        return math.log(math.tan(math.pi / 4 + rad / 2))

    def latlon_to_pixel(lat, lon, bounds, img_w, img_h):
        lat_min, lat_max, lon_min, lon_max = bounds
        y_min = mercator_y(lat_min)
        y_max = mercator_y(lat_max)
        y_merc = mercator_y(lat)
        x_ratio = (lon - lon_min) / (lon_max - lon_min)
        y_ratio = (y_max - y_merc) / (y_max - y_min)
        return int(x_ratio * img_w), int(y_ratio * img_h)

    def get_temp_color(tm):
        if tm < 10.0:
            return (30, 58, 138, 230), (255, 255, 255)
        elif tm < 15.0:
            return (2, 132, 199, 230), (255, 255, 255)
        elif tm < 20.0:
            return (16, 185, 129, 230), (255, 255, 255)
        elif tm < 25.0:
            return (245, 158, 11, 230), (0, 0, 0)
        elif tm < 30.0:
            return (239, 68, 68, 230), (255, 255, 255)
        else:
            return (153, 27, 27, 230), (255, 255, 255)

    try:
        font_title_p = ImageFont.truetype("arialbd.ttf", 32)
        font_sub_p = ImageFont.truetype("arial.ttf", 20)
        font_pill_p = ImageFont.truetype("arialbd.ttf", 16)
        font_title_port = ImageFont.truetype("arialbd.ttf", 26)
        font_sub_port = ImageFont.truetype("arial.ttf", 17)
        font_pill_port = ImageFont.truetype("arialbd.ttf", 14)
    except:
        font_title_p = font_sub_p = font_pill_p = font_title_port = font_sub_port = font_pill_port = ImageFont.load_default()

    bg_dir = os.path.join(DEST_DIR, "A_CONSERVER_ABSOLUMENT")
    img_paysage_path = os.path.join(bg_dir, "CARTE PAYSAGE METEOCIEL.png")
    img_portrait_path = os.path.join(bg_dir, "CARTE PORTRAIT METEOCIEL.png")

    if not os.path.exists(img_paysage_path) or not os.path.exists(img_portrait_path):
        print("Warning: Background images CARTE PAYSAGE/PORTRAIT METEOCIEL.png not found.")
        return

    # --- 1. CARTE PAYSAGE (1448 x 1086) ---
    img_p = Image.open(img_paysage_path).convert("RGBA")
    draw_p = ImageDraw.Draw(img_p)
    bounds_p = (41.2, 51.3, -5.6, 9.8)

    banner_w, banner_h = 1380, 110
    banner_x, banner_y = (img_p.width - banner_w) // 2, 20
    draw_p.rounded_rectangle([banner_x, banner_y, banner_x + banner_w, banner_y + banner_h], radius=16, fill=(15, 23, 42, 220), outline=(255, 204, 0), width=2)
    draw_p.text((banner_x + 25, banner_y + 15), "INDICATEUR THERMIQUE NATIONAL (ITN)", fill="#ffcc00", font=font_title_p)
    draw_p.text((banner_x + 25, banner_y + 60), f"Carte des 30 stations — {display_date}", fill="#ffffff", font=font_sub_p)

    summary_text = f"Moyenne : {tm_nat_str}°C  |  Anomalie : {anom_sign}°C"
    draw_p.text((banner_x + banner_w - 550, banner_y + 38), summary_text, fill="#38bdf8", font=font_title_p)

    for loc_idx, loc in enumerate(STATIONS_ITN):
        loc_forecast = forecasts[loc_idx]["daily"]
        tmin = loc_forecast["temperature_2m_min"][0]
        tmax = loc_forecast["temperature_2m_max"][0]
        if tmin is None or tmax is None:
            continue
        tm_st = round((tmin + tmax) / 2.0, 1)
        tm_st_str = f"{tm_st:.1f}".replace(".", ",")
        city_name = loc["name"].split("-")[0]
        label = f"{city_name} {tm_st_str}°"

        px, py = latlon_to_pixel(loc["lat"], loc["lon"], bounds_p, img_p.width, img_p.height)
        bg_col, text_col = get_temp_color(tm_st)

        bbox = draw_p.textbbox((0, 0), label, font=font_pill_p)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        pw, ph = tw + 14, th + 10
        rx, ry = px - pw // 2, py - ph // 2

        draw_p.rounded_rectangle([rx, ry, rx + pw, ry + ph], radius=10, fill=bg_col, outline=(255, 255, 255, 200), width=1)
        draw_p.text((rx + 7, ry + 4), label, fill=text_col, font=font_pill_p)

    out_tv = os.path.join(DEST_DIR, "indicateur_thermique_carte_tv.png")
    img_p.save(out_tv)
    print(f"Carte ITN TV (Paysage) sauvegardée : {out_tv}")

    # --- 2. CARTE PORTRAIT (941 x 1672) ---
    img_port = Image.open(img_portrait_path).convert("RGBA")
    draw_port = ImageDraw.Draw(img_port)
    bounds_port = (40.8, 51.6, -5.8, 10.2)

    banner_w, banner_h = 880, 140
    banner_x, banner_y = (img_port.width - banner_w) // 2, 30
    draw_port.rounded_rectangle([banner_x, banner_y, banner_x + banner_w, banner_y + banner_h], radius=16, fill=(15, 23, 42, 220), outline=(255, 204, 0), width=2)
    draw_port.text((banner_x + 20, banner_y + 15), "INDICATEUR THERMIQUE NATIONAL", fill="#ffcc00", font=font_title_port)
    draw_port.text((banner_x + 20, banner_y + 52), f"Carte des 30 stations — {display_date}", fill="#ffffff", font=font_sub_port)
    draw_port.text((banner_x + 20, banner_y + 90), f"ITN : {tm_nat_str}°C  |  Anomalie : {anom_sign}°C vs normales", fill="#38bdf8", font=font_sub_port)

    for loc_idx, loc in enumerate(STATIONS_ITN):
        loc_forecast = forecasts[loc_idx]["daily"]
        tmin = loc_forecast["temperature_2m_min"][0]
        tmax = loc_forecast["temperature_2m_max"][0]
        if tmin is None or tmax is None:
            continue
        tm_st = round((tmin + tmax) / 2.0, 1)
        tm_st_str = f"{tm_st:.1f}".replace(".", ",")
        city_name = loc["name"].split("-")[0]
        label = f"{city_name} {tm_st_str}°"

        px, py = latlon_to_pixel(loc["lat"], loc["lon"], bounds_port, img_port.width, img_port.height)
        bg_col, text_col = get_temp_color(tm_st)

        bbox = draw_port.textbbox((0, 0), label, font=font_pill_port)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        pw, ph = tw + 12, th + 8
        rx, ry = px - pw // 2, py - ph // 2

        draw_port.rounded_rectangle([rx, ry, rx + pw, ry + ph], radius=8, fill=bg_col, outline=(255, 255, 255, 200), width=1)
        draw_port.text((rx + 6, ry + 3), label, fill=text_col, font=font_pill_port)

    out_tiktok = os.path.join(DEST_DIR, "indicateur_thermique_carte_tiktok.png")
    img_port.save(out_tiktok)
    print(f"Carte ITN TikTok (Portrait) sauvegardée : {out_tiktok}")

def generate_social_post(itn_data):
    try:
        # --- Valeurs ITN (pic, creux, fin d'échéance) ---
        dates = [datetime.strptime(d["date"], "%Y-%m-%d") for d in itn_data[:11]]
        tms   = [d["tm"]      for d in itn_data[:11]]
        norms = [d["norm_tm"] for d in itn_data[:11]]

        max_tm  = max(tms);  max_idx  = tms.index(max_tm)
        min_tm  = min(tms);  min_idx  = tms.index(min_tm)
        final_tm = tms[-1];  final_norm = norms[-1]

        MONTHS_FR = ["janvier","fevrier","mars","avril","mai","juin",
                     "juillet","aout","septembre","octobre","novembre","decembre"]
        def fmt_d(dt): return f"{dt.day} {MONTHS_FR[dt.month-1]}"
        def f_t(v):    return f"{v:.1f}".replace(".", ",")

        max_date   = fmt_d(dates[max_idx])
        min_date   = fmt_d(dates[min_idx])
        final_date = fmt_d(dates[-1])
        max_anom   = max_tm  - norms[max_idx]
        min_anom   = min_tm  - norms[min_idx]
        final_anom = final_tm - final_norm
        def sign(v): return f"+{f_t(v)}" if v >= 0 else f_t(v)

        today_str  = datetime.now().strftime("%Y_%m_%d")
        today_nice = datetime.now().strftime("%d/%m/%Y")

        # --- Données de la compétence vigilance ---
        sys_path = r"C:\Users\grego\.gemini\config\skills\vigilance\scripts"
        import sys, os, tempfile
        if sys_path not in sys.path:
            sys.path.append(sys_path)

        bulletin_titre = ""
        bulletin_texte = ""
        j2_j3_text     = ""
        j4_j7_text     = ""
        num_rouge      = 0
        num_orange     = 0

        try:
            from get_vigilance_data import (get_national_forecast,
                                             get_departments_vigilance,
                                             get_pdf_info_and_images)

            # 1. Bulletin national du jour (titre + corps)
            nf = get_national_forecast()
            bulletin_titre = nf.get("titre", "").strip()
            bulletin_texte = nf.get("temps",  "").strip()

            # 2. Commentaires J+2/J+3 et J+4/J+7 du PDF
            out_tmp = tempfile.mkdtemp()
            (j2_j3_raw, j4_j7_raw), _ = get_pdf_info_and_images(out_tmp)
            # Nettoyer les sauts de ligne intempestifs
            j2_j3_text = " ".join(j2_j3_raw.split()) if j2_j3_raw else ""
            j4_j7_text = " ".join(j4_j7_raw.split()) if j4_j7_raw else ""

            # 3. Vigilance départementale
            vig  = get_departments_vigilance()
            now  = datetime.now()
            vig_key = "demain" if (now.hour > 16 or (now.hour == 16 and now.minute >= 30)) else "aujourdhui"
            data = vig.get(vig_key, vig.get("aujourdhui", {}))
            colors = data.get("colors", {})
            total_rouge  = set()
            total_orange = set()
            for p, deps in colors.get("Rouge",  {}).items(): total_rouge.update(deps)
            for p, deps in colors.get("Orange", {}).items(): total_orange.update(deps)
            num_rouge  = len(total_rouge)
            num_orange = len(total_orange)

        except Exception as ve:
            print(f"Warning: Could not fetch vigilance data for post: {ve}")

        # --- Construction de l'article ---
        # Accroche : reprend le titre du bulletin MF si dispo, sinon générique
        if bulletin_titre:
            accroche = bulletin_titre.rstrip(".").capitalize()
        else:
            accroche = "Forte chaleur generalisee et instabilite orageuse pour les prochains jours"

        # Bloc vigilance
        vig_block = ""
        if num_rouge > 0 or num_orange > 0:
            vig_block = (
                f"\n⚠️ Vigilance active : les previsionnistes ont place "
                f"{num_rouge} departements en Vigilance Rouge et "
                f"{num_orange} departements en Vigilance Orange. "
                f"Hydratez-vous, restez au frais et prenez des nouvelles des personnes isolees."
            )

        # Résumé du bulletin du jour (tronqué à 300 car. pour rester lisible sur LinkedIn)
        situation_bloc = ""
        if bulletin_texte:
            excerpt = bulletin_texte[:400].rsplit(" ", 1)[0] + "..."
            situation_bloc = f"\n{excerpt}"

        # J+2/J+3
        j2j3_bloc = ""
        if j2_j3_text:
            j2j3_bloc = f"\n{j2_j3_text}"

        # J+4/J+7
        j4j7_bloc = ""
        if j4_j7_text:
            j4j7_bloc = f"\n{j4_j7_text}"

        # Hashtags dynamiques
        hashtags = ["#Meteo", "#Previsions", "#France", "#MeteoClimatPro"]
        if num_rouge > 0 or "canicule" in (bulletin_titre + j2_j3_text + j4_j7_text).lower():
            hashtags.insert(1, "#Canicule")
        if "orage" in (bulletin_titre + j2_j3_text + j4_j7_text).lower():
            hashtags.append("#Orages")

        post_content = f"""📊 PREVISIONS METEOROLOGIQUES — {today_nice.replace("/", " ")}

{accroche}.{vig_block}

📍 SITUATION DU JOUR{situation_bloc}

La temperature moyenne nationale (calculee sur 30 stations de reference) atteint {f_t(max_tm)}°C autour du {max_date}, soit +{f_t(max_anom)}°C au-dessus des normales de saison (1991-2020).

⛈️ EVOLUTION DES PROCHAINS JOURS (J+2/J+3){j2j3_bloc}

👉 Indicateur : point bas attendu autour du {min_date} avec {f_t(min_tm)}°C ({sign(min_anom)}°C vs normales).

☀️ TENDANCE DE FIN D'ECHEANCE (J+4 A J+7){j4j7_bloc}

👉 Remontee vers {f_t(final_tm)}°C vers le {final_date} ({sign(final_anom)}°C vs normales).

Retrouvez le graphique complet de cette evolution sur le Bureau et dans le dossier cartes_alertes.

(Previsions etablies le {today_nice} a partir des donnees des previsionnistes)

{" ".join(hashtags)}"""

        desktop_dir = r"C:\Users\grego\Desktop"
        file_path = os.path.join(desktop_dir, f"post_indicateur_thermique_{today_str}.txt")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(post_content)
        print(f"Social media post written successfully to {file_path}!")
    except Exception as e:
        print(f"Warning: Could not generate social media post: {e}")
        import traceback; traceback.print_exc()

if __name__ == "__main__":
    try:
        # 1. Charger les normales locales
        normals_file = os.path.join(PROJECT_DIR, "normales_indicateur_national.json")
        if not os.path.exists(normals_file):
            print(f"Normals file {normals_file} not found. Running download_normals.py first...")
            # Fallback direct download
            import download_normals
            download_normals.download_and_save_normals()
            
        with open(normals_file, "r", encoding="utf-8") as f:
            normals = json.load(f)
            
        # 2. Récupérer les prévisions des 30 stations (Open-Meteo)
        forecasts = fetch_itn_forecast()
        itn_data = compute_indicators(forecasts, normals)
        
        # 3. Récupérer les observations réelles de l'année en cours (Infoclimat)
        infoclimat_data = fetch_infoclimat_data()
        
        # 4. Préparer les tableaux de suivi annuel (366 jours)
        tm_2026_full = [float('nan')] * 366
        tn_2026_full = [float('nan')] * 366
        tx_2026_full = [float('nan')] * 366
        tm_normal_full = [normals["tml"][i][1] for i in range(366)]
        
        # Charger les observations si disponibles
        if infoclimat_data and 'mf' in infoclimat_data:
            obs = infoclimat_data['mf']
            for doy, val in obs.get('tm2026', []):
                if doy < 366: tm_2026_full[doy] = val
            for doy, val in obs.get('tn2026', []):
                if doy < 366: tn_2026_full[doy] = val
            for doy, val in obs.get('tx2026', []):
                if doy < 366: tx_2026_full[doy] = val
                
        # Injecter les prévisions (les prévisions écrasent/complètent les derniers jours)
        for d_data in itn_data:
            dt = datetime.strptime(d_data["date"], "%Y-%m-%d")
            doy = get_doy_index(dt)
            tm_2026_full[doy] = d_data["tm"]
            tn_2026_full[doy] = d_data["tn"]
            tx_2026_full[doy] = d_data["tx"]
            
        # 5. Générer le graphique zoom prévisions (PNG)
        generate_matplotlib_chart(itn_data)
        
        # 5b. Générer le graphique style grand public TV (PNG)
        generate_broadcast_tv_chart(itn_data)
        
        # 5c. Générer le graphique style grand public TV Portrait (TikTok) (PNG)
        generate_broadcast_tiktok_chart(itn_data)

        # 5d. Générer la carte de l'ITN des 30 stations sur fond Météociel (Paysage & Portrait)
        generate_broadcast_itn_maps(itn_data, forecasts)
        
        # 6. Générer le graphique annuel complet (PNG)
        generate_matplotlib_annual_chart(tm_2026_full, tm_normal_full)
        
        # 7. Générer la page HTML interactive (Annuelle + Zoom)
        generate_html_dashboard(itn_data, tm_2026_full, tn_2026_full, tx_2026_full, tm_normal_full)
        
        # 8. Exporter les données de l'année au format CSV sur le Bureau
        generate_csv_export(tm_2026_full, tm_normal_full, itn_data)
        
        # 9. Rédiger automatiquement l'article pour les réseaux sociaux sur le Bureau
        generate_social_post(itn_data)
        
        print("Success! All annual tracking and forecasting files have been created.")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
