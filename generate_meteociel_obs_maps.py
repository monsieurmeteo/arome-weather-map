# -*- coding: utf-8 -*-
"""
generate_meteociel_obs_maps.py
═══════════════════════════════════════════════════════════════════════════════
Phase 2 : Génération de cartes d'observations depuis la base SQLite Météociel.

PRÉREQUIS : update_daily_obs.py doit avoir été lancé avant pour alimenter la DB.

USAGE :
  python generate_meteociel_obs_maps.py --date 20260711 --zone france --pack all
  python generate_meteociel_obs_maps.py --date 20260711 --zone hdf --param tmax --orientation both
  python generate_meteociel_obs_maps.py --date 20260711 --zone france --param records_all --orientation portrait

PARAMS DISPONIBLES :
  tmax | tmin | anomalie_tmax | anomalie_tmin | amplitude | tmoy
  precip | anomalie_precip | secheresse
  gust | coups_de_vent
  records_tmax | records_tmin | records_precip | records_gust | records_all | records_absolus
═══════════════════════════════════════════════════════════════════════════════
"""

import sys, os, json, sqlite3, math, argparse, base64, time, threading, shutil, subprocess, calendar as _calendar
import http.server, socketserver
from datetime import date as dt_date, timedelta

# ── Chemins ──────────────────────────────────────────────────────────────────
current_dir = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = current_dir
DB_PATH = os.path.join(current_dir, "data", "meteo_data.db")
DATA_JSON = os.path.join(current_dir, "meteociel_obs_data.json")
PORT = 8002

if not os.path.exists(DB_PATH):
    DB_PATH = r"C:\Users\grego\.gemini\config\skills\meteo\data\meteo_data.db"

if os.environ.get("GITHUB_ACTIONS"):
    DEST_DIR = os.path.abspath(os.path.join(current_dir, "..", "cartes_alertes"))
    os.makedirs(DEST_DIR, exist_ok=True)
    CHROME_PATH = "/usr/bin/google-chrome"
else:
    DEST_DIR = r"C:\Users\grego\Desktop\cartes_alertes"
    CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

sys.path.insert(0, current_dir)

# ── Zones → départements ─────────────────────────────────────────────────────
ZONE_DEPTS = {
    "france":   None,  # toutes
    "hdf":      ["02","59","60","62","80"],
    "npdc":     ["59","62"],
    "normandie":["14","27","50","61","76"],
    "idf":      ["75","77","78","91","92","93","94","95"],
    "ges":      ["08","10","51","52","54","55","57","67","68","88"],
    "ara":      ["01","03","07","15","26","38","42","43","63","69","73","74"],
    "naq":      ["16","17","19","23","24","33","40","47","64","79","86","87"],
    "occ":      ["09","11","12","30","31","32","34","46","48","65","66","81","82"],
    "paca":     ["04","05","06","13","83","84"],
    "bfc":      ["21","25","39","58","70","71","89","90"],
    "bre":      ["22","29","35","56"],
    "pdl":      ["44","49","53","72","85"],
    "cvl":      ["18","28","36","37","41","45"],
    "cor":      ["20","2A","2B","2a","2b"],
}
ZONE_LABELS = {
    "france":"France entière","hdf":"Hauts-de-France","npdc":"Nord-Pas-de-Calais","normandie":"Normandie",
    "idf":"Île-de-France","ges":"Grand Est","ara":"Auvergne-Rhône-Alpes",
    "naq":"Nouvelle-Aquitaine","occ":"Occitanie","paca":"PACA",
    "bfc":"Bourgogne-Franche-Comté","bre":"Bretagne","pdl":"Pays de la Loire",
    "cvl":"Centre-Val de Loire","cor":"Corse",
}
ZONE_MAP = {
    "france":   {"center":[46.6,2.3],  "zoom":6, "zoom_portrait":6,  "min_dist":95, "max_st":65},
    "hdf":      {"center":[50.1,2.9],  "zoom":8, "zoom_portrait":8,  "min_dist":30, "max_st":45},
    "npdc":     {"center":[50.45,2.75], "zoom":9, "zoom_portrait":9,  "min_dist":24, "max_st":25},
    "normandie":{"center":[49.0,0.2],  "zoom":8, "zoom_portrait":8,  "min_dist":30, "max_st":45},
    "idf":      {"center":[48.75,2.5], "zoom":9, "zoom_portrait":9,  "min_dist":16, "max_st":35},
    "ges":      {"center":[48.5,6.5],  "zoom":7, "zoom_portrait":7,  "min_dist":55, "max_st":50},
    "ara":      {"center":[45.5,4.5],  "zoom":7, "zoom_portrait":7,  "min_dist":55, "max_st":50},
    "naq":      {"center":[44.6,0.0],  "zoom":7, "zoom_portrait":7,  "min_dist":55, "max_st":50},
    "occ":      {"center":[43.6,2.2],  "zoom":7, "zoom_portrait":7,  "min_dist":50, "max_st":50},
    "paca":     {"center":[43.9,6.0],  "zoom":8, "zoom_portrait":8,  "min_dist":30, "max_st":40},
    "bfc":      {"center":[47.0,5.0],  "zoom":8, "zoom_portrait":8,  "min_dist":30, "max_st":40},
    "bre":      {"center":[48.1,-2.8], "zoom":8, "zoom_portrait":8,  "min_dist":30, "max_st":35},
    "pdl":      {"center":[47.5,-1.0], "zoom":8, "zoom_portrait":8,  "min_dist":30, "max_st":35},
    "cvl":      {"center":[47.4,1.5],  "zoom":8, "zoom_portrait":8,  "min_dist":30, "max_st":35},
    "cor":      {"center":[42.0,9.0],  "zoom":8, "zoom_portrait":8,  "min_dist":22, "max_st":25},
}

DEPT_NAMES = {
    "01": "Ain", "02": "Aisne", "03": "Allier", "04": "Alpes-de-Haute-Provence", "05": "Hautes-Alpes",
    "06": "Alpes-Maritimes", "07": "Ardèche", "08": "Ardennes", "09": "Ariège", "10": "Aube",
    "11": "Aude", "12": "Aveyron", "13": "Bouches-du-Rhône", "14": "Calvados", "15": "Cantal",
    "16": "Charente", "17": "Charente-Maritime", "18": "Cher", "19": "Corrèze", "2A": "Corse-du-Sud",
    "2B": "Haute-Corse", "21": "Côte-d'Or", "22": "Côtes-d'Armor", "23": "Creuse", "24": "Dordogne",
    "25": "Doubs", "26": "Drôme", "27": "Eure", "28": "Eure-et-Loir", "29": "Finistère",
    "30": "Gard", "31": "Haute-Garonne", "32": "Gers", "33": "Gironde", "34": "Hérault",
    "35": "Ille-et-Vilaine", "36": "Indre", "37": "Indre-et-Loire", "38": "Isère", "39": "Jura",
    "40": "Landes", "41": "Loir-et-Cher", "42": "Loire", "43": "Haute-Loire", "44": "Loire-Atlantique",
    "45": "Loiret", "46": "Lot", "47": "Lot-et-Garonne", "48": "Lozère", "49": "Maine-et-Loire",
    "50": "Manche", "51": "Marne", "52": "Haute-Marne", "53": "Mayenne", "54": "Meurthe-et-Moselle",
    "55": "Meuse", "56": "Morbihan", "57": "Moselle", "58": "Nièvre", "59": "Nord",
    "60": "Oise", "61": "Orne", "62": "Pas-de-Calais", "63": "Puy-de-Dôme", "64": "Pyrénées-Atlantiques",
    "65": "Hautes-Pyrénées", "66": "Pyrénées-Orientales", "67": "Bas-Rhin", "68": "Haut-Rhin", "69": "Rhône",
    "70": "Haute-Saône", "71": "Saône-et-Loire", "72": "Sarthe", "73": "Savoie", "74": "Haute-Savoie",
    "75": "Paris", "76": "Seine-Maritime", "77": "Seine-et-Marne", "78": "Yvelines", "79": "Deux-Sèvres",
    "80": "Somme", "81": "Tarn", "82": "Tarn-et-Garonne", "83": "Var", "84": "Vaucluse",
    "85": "Vendée", "86": "Vienne", "87": "Haute-Vienne", "88": "Vosges", "89": "Yonne",
    "90": "Territoire de Belfort", "91": "Essonne", "92": "Hauts-de-Seine", "93": "Seine-Saint-Denis",
    "94": "Val-de-Marne", "95": "Val-d'Oise", "971": "Guadeloupe", "972": "Martinique",
    "973": "Guyane", "974": "La Réunion", "976": "Mayotte"
}

ALL_PARAMS = [
    "tmax","tmin","anomalie_tmax","anomalie_tmin","amplitude","tmoy",
    "precip","anomalie_precip","secheresse",
    "gust","coups_de_vent",
    "records_tmax","records_tmin","records_precip","records_gust",
    "records_all","records_absolus","records_mensuels",
]
PARAM_LABELS = {
    "tmax":"Températures maximales","tmin":"Températures minimales",
    "anomalie_tmax":"Anomalie Tmax vs normale","anomalie_tmin":"Anomalie Tmin vs normale",
    "amplitude":"Amplitude thermique","tmoy":"Température moyenne estimée",
    "precip":"Précipitations 24h","anomalie_precip":"Anomalie précipitations",
    "secheresse":"Stations sans précipitations",
    "gust":"Rafales maximales","coups_de_vent":"Coups de vent (80/90/100 km/h)",
    "records_tmax":"Records Tmax","records_tmin":"Records Tmin",
    "records_precip":"Records Précipitations","records_gust":"Records Rafales",
    "records_all":"Tous les records du jour","records_absolus":"Records absolus",
    "records_mensuels":"Records mensuels",
    "bilan_jour":"Bilan du jour — Top 4 extrêmes",
}

# ── Saisons ────────────────────────────────────────────────────────────────────
SEASONS = {
    'hiver':     lambda y: (f"{y-1}1201", f"{y}0228"),
    'printemps': lambda y: (f"{y}0301",   f"{y}0531"),
    'ete':       lambda y: (f"{y}0601",   f"{y}0831"),
    'automne':   lambda y: (f"{y}0901",   f"{y}1130"),
}
SEASON_LABELS = {'hiver':'Hiver','printemps':'Printemps','ete':'Été','automne':'Automne'}

# ── Haversine ─────────────────────────────────────────────────────────────────
def haversine(la1,lo1,la2,lo2):
    R=6371; la1,lo1,la2,lo2=(math.radians(x) for x in [la1,lo1,la2,lo2])
    return R*2*math.asin(math.sqrt(math.sin((la2-la1)/2)**2+math.cos(la1)*math.cos(la2)*math.sin((lo2-lo1)/2)**2))

# ── Density filter ────────────────────────────────────────────────────────────
def filter_by_density(stations, min_dist_km, priority_set=None):
    """Keep stations spaced at least min_dist_km apart. Priority stations (records) always kept."""
    priority_set = priority_set or set()
    kept = []
    for st in stations:
        if st["code"] in priority_set:
            kept.append(st)
            continue
        if st.get("lat") is None: continue
        too_close = False
        for k in kept:
            if k.get("lat") is None: continue
            if haversine(st["lat"],st["lon"],k["lat"],k["lon"]) < min_dist_km:
                too_close = True; break
        if not too_close:
            kept.append(st)
    return kept

# ── Date format ───────────────────────────────────────────────────────────────
MONTHS_FR = ["","janvier","février","mars","avril","mai","juin",
             "juillet","août","septembre","octobre","novembre","décembre"]

def date_fr(date_str):
    y,m,d = int(date_str[:4]),int(date_str[4:6]),int(date_str[6:])
    return f"{d} {MONTHS_FR[m]} {y}"

# ── SQLite query ──────────────────────────────────────────────────────────────
def get_conn():
    return sqlite3.connect(DB_PATH)

def load_observations(date_str, zone):
    """Load all observations for a date, filtered by zone (region or department)."""
    conn = get_conn()
    c = conn.cursor()
    depts = ZONE_DEPTS.get(zone)

    is_dept = zone.upper() in DEPT_NAMES or zone.isdigit() or (len(zone) == 2 and zone[0].isdigit()) or zone.lower() in ("2a", "2b")

    if depts:
        placeholders = ",".join("?"*len(depts))
        c.execute(f"""
            SELECT o.station_code, s.name, s.dept, s.lat, s.lon,
                   o.tmax, o.tmin, o.precip, o.gust,
                   o.tmax_rec_m, o.tmax_rec_m_date, o.tmax_rec_a, o.tmax_rec_a_date,
                   o.tmin_rec_m, o.tmin_rec_m_date, o.tmin_rec_a, o.tmin_rec_a_date,
                   o.precip_rec_m, o.precip_rec_m_date, o.precip_rec_a, o.precip_rec_a_date,
                   o.gust_rec_m,  o.gust_rec_m_date,  o.gust_rec_a,  o.gust_rec_a_date,
                   s.dans_tx, s.dans_fxi, s.dans_rrtn
            FROM observations o
            JOIN stations s ON o.station_code = s.code
            WHERE o.date = ? AND s.dept IN ({placeholders})
            ORDER BY s.dept, s.name
        """, [date_str] + depts)
    elif is_dept:
        dept_code = zone.upper()
        c.execute("""
            SELECT o.station_code, s.name, s.dept, s.lat, s.lon,
                   o.tmax, o.tmin, o.precip, o.gust,
                   o.tmax_rec_m, o.tmax_rec_m_date, o.tmax_rec_a, o.tmax_rec_a_date,
                   o.tmin_rec_m, o.tmin_rec_m_date, o.tmin_rec_a, o.tmin_rec_a_date,
                   o.precip_rec_m, o.precip_rec_m_date, o.precip_rec_a, o.precip_rec_a_date,
                   o.gust_rec_m,  o.gust_rec_m_date,  o.gust_rec_a,  o.gust_rec_a_date,
                   s.dans_tx, s.dans_fxi, s.dans_rrtn
            FROM observations o
            JOIN stations s ON o.station_code = s.code
            WHERE o.date = ? AND s.dept = ?
            ORDER BY s.name
        """, [date_str, dept_code])
    else:
        c.execute("""
            SELECT o.station_code, s.name, s.dept, s.lat, s.lon,
                   o.tmax, o.tmin, o.precip, o.gust,
                   o.tmax_rec_m, o.tmax_rec_m_date, o.tmax_rec_a, o.tmax_rec_a_date,
                   o.tmin_rec_m, o.tmin_rec_m_date, o.tmin_rec_a, o.tmin_rec_a_date,
                   o.precip_rec_m, o.precip_rec_m_date, o.precip_rec_a, o.precip_rec_a_date,
                   o.gust_rec_m,  o.gust_rec_m_date,  o.gust_rec_a,  o.gust_rec_a_date,
                   s.dans_tx, s.dans_fxi, s.dans_rrtn
            FROM observations o
            JOIN stations s ON o.station_code = s.code
            WHERE o.date = ?
            ORDER BY s.dept, s.name
        """, [date_str])

    cols = ["code","name","dept","lat","lon",
            "tmax","tmin","precip","gust",
            "tmax_rec_m","tmax_rec_m_date","tmax_rec_a","tmax_rec_a_date",
            "tmin_rec_m","tmin_rec_m_date","tmin_rec_a","tmin_rec_a_date",
            "precip_rec_m","precip_rec_m_date","precip_rec_a","precip_rec_a_date",
            "gust_rec_m","gust_rec_m_date","gust_rec_a","gust_rec_a_date"]
    rows = [{cols[i]:r[i] for i in range(len(cols))} for r in c.fetchall()]
    conn.close()

    # Also load normales for anomaly maps
    conn = get_conn()
    c = conn.cursor()
    month = int(date_str[4:6])
    if depts:
        c.execute(f"""
            SELECT nr.station_code, nr.tmax_norm, nr.tmin_norm, nr.precip_norm
            FROM normales_records nr
            JOIN stations s ON nr.station_code = s.code
            WHERE nr.month = ? AND s.dept IN ({placeholders})
        """, [month] + depts)
    elif is_dept:
        dept_code = zone.upper()
        c.execute("""
            SELECT nr.station_code, nr.tmax_norm, nr.tmin_norm, nr.precip_norm
            FROM normales_records nr
            JOIN stations s ON nr.station_code = s.code
            WHERE nr.month = ? AND s.dept = ?
        """, [month, dept_code])
    else:
        c.execute("SELECT station_code, tmax_norm, tmin_norm, precip_norm FROM normales_records WHERE month = ?", [month])
    norms = {r[0]: {"tmax_norm":r[1],"tmin_norm":r[2],"precip_norm":r[3]} for r in c.fetchall()}
    conn.close()

    for row in rows:
        row.update(norms.get(row["code"]) or {"tmax_norm":None,"tmin_norm":None,"precip_norm":None})

    return rows

# ── Build station list for a given param ──────────────────────────────────────
def build_stations(rows, param, min_dist_km):
    """Compute value, color hint, record flags for each station and apply density filter."""
    stations = []
    priority = set()

    for r in rows:
        lat, lon = r.get("lat"), r.get("lon")
        if lat is None or lon is None: continue

        is_major = False
        if param in ("tmax", "tmin", "anomalie_tmax", "anomalie_tmin", "amplitude", "tmoy", "records_tmax", "records_tmin"):
            is_major = r.get("dans_tx") == "Oui"
        elif param in ("precip", "anomalie_precip", "secheresse", "records_precip"):
            is_major = r.get("dans_rrtn") == "Oui"
        elif param in ("gust", "coups_de_vent", "records_gust"):
            is_major = r.get("dans_fxi") == "Oui"
        else:
            is_major = r.get("dans_tx") == "Oui" or r.get("dans_fxi") == "Oui" or r.get("dans_rrtn") == "Oui"

        st = {"code":r["code"],"name":r["name"],"dept":r["dept"],"lat":lat,"lon":lon,
              "value":None,"value_display":None,
              "is_record_m":False,"is_record_a":False,
              "rec_val":None,"rec_date":None,"rec_type":None,
              "obs_date":None,  # date du pic (mode période)
              "is_major":is_major}

        tmax = r.get("tmax"); tmin = r.get("tmin")
        precip = r.get("precip"); gust = r.get("gust")

        # ── Compute value per param ──
        if param == "tmax":
            if tmax is None: continue
            st["value"] = tmax
            st["value_display"] = f"{tmax:.1f} °c".replace('.', ',')
            if r.get("tmax_rec_a") is not None and tmax >= r["tmax_rec_a"]:
                st["is_record_a"] = True; st["rec_val"] = r["tmax_rec_a"]; st["rec_date"] = r.get("tmax_rec_a_date"); priority.add(r["code"])
            elif r.get("tmax_rec_m") is not None and tmax >= r["tmax_rec_m"]:
                st["is_record_m"] = True; st["rec_val"] = r["tmax_rec_m"]; st["rec_date"] = r.get("tmax_rec_m_date"); priority.add(r["code"])

        elif param == "tmin":
            if tmin is None: continue
            st["value"] = tmin
            st["value_display"] = f"{tmin:.1f} °c".replace('.', ',')
            if r.get("tmin_rec_a") is not None and tmin <= r["tmin_rec_a"]:
                st["is_record_a"] = True; st["rec_val"] = r["tmin_rec_a"]; st["rec_date"] = r.get("tmin_rec_a_date"); priority.add(r["code"])
            elif r.get("tmin_rec_m") is not None and tmin <= r["tmin_rec_m"]:
                st["is_record_m"] = True; st["rec_val"] = r["tmin_rec_m"]; st["rec_date"] = r.get("tmin_rec_m_date"); priority.add(r["code"])

        elif param == "anomalie_tmax":
            if tmax is None or r.get("tmax_norm") is None: continue
            anom = round(tmax - r["tmax_norm"], 1)
            st["value"] = anom; st["value_display"] = f"{anom:+.1f} °c".replace('.', ',')

        elif param == "anomalie_tmin":
            if tmin is None or r.get("tmin_norm") is None: continue
            anom = round(tmin - r["tmin_norm"], 1)
            st["value"] = anom; st["value_display"] = f"{anom:+.1f} °c".replace('.', ',')

        elif param == "amplitude":
            if tmax is None or tmin is None: continue
            amp = round(tmax - tmin, 1)
            if amp < 0: continue
            st["value"] = amp; st["value_display"] = f"{amp:.1f} °c".replace('.', ',')

        elif param == "tmoy":
            if tmax is None or tmin is None: continue
            tmoy = round((tmax+tmin)/2, 1)
            st["value"] = tmoy; st["value_display"] = f"{tmoy:.1f} °c".replace('.', ',')

        elif param == "precip":
            if precip is None: continue
            st["value"] = precip; st["value_display"] = f"{precip:.1f} mm".replace('.', ',')
            if r.get("precip_rec_a") is not None and precip >= r["precip_rec_a"]:
                st["is_record_a"] = True; st["rec_val"] = r["precip_rec_a"]; st["rec_date"] = r.get("precip_rec_a_date"); priority.add(r["code"])
            elif r.get("precip_rec_m") is not None and precip >= r["precip_rec_m"]:
                st["is_record_m"] = True; st["rec_val"] = r["precip_rec_m"]; st["rec_date"] = r.get("precip_rec_m_date"); priority.add(r["code"])

        elif param == "anomalie_precip":
            if precip is None or r.get("precip_norm") is None or r["precip_norm"] == 0: continue
            anom_pct = round((precip - r["precip_norm"]) / r["precip_norm"] * 100)
            st["value"] = anom_pct; st["value_display"] = f"{anom_pct:+.0f}%"

        elif param == "secheresse":
            if precip is None or precip > 0: continue
            st["value"] = 0; st["value_display"] = "0 mm"

        elif param == "gust":
            if gust is None or gust < 30: continue
            st["value"] = gust; st["value_display"] = f"{gust:.0f}"
            if r.get("gust_rec_a") is not None and gust >= r["gust_rec_a"]:
                st["is_record_a"] = True; st["rec_val"] = r["gust_rec_a"]; st["rec_date"] = r.get("gust_rec_a_date"); priority.add(r["code"])
            elif r.get("gust_rec_m") is not None and gust >= r["gust_rec_m"]:
                st["is_record_m"] = True; st["rec_val"] = r["gust_rec_m"]; st["rec_date"] = r.get("gust_rec_m_date"); priority.add(r["code"])

        elif param == "coups_de_vent":
            if gust is None or gust < 80: continue
            st["value"] = gust; st["value_display"] = f"{gust:.0f}"
            if r.get("gust_rec_a") is not None and gust >= r["gust_rec_a"]:
                st["is_record_a"] = True; st["rec_val"] = r["gust_rec_a"]; st["rec_date"] = r.get("gust_rec_a_date"); priority.add(r["code"])
            elif r.get("gust_rec_m") is not None and gust >= r["gust_rec_m"]:
                st["is_record_m"] = True; st["rec_val"] = r["gust_rec_m"]; st["rec_date"] = r.get("gust_rec_m_date"); priority.add(r["code"])

        elif param in ("records_tmax","records_all","records_absolus","records_mensuels"):
            # Tmax record
            if tmax is not None:
                if r.get("tmax_rec_a") is not None and tmax >= r["tmax_rec_a"]:
                    if param == "records_absolus" or param == "records_all" or param == "records_tmax" or param == "records_mensuels":
                        st["value"] = tmax; st["value_display"] = f"{tmax:.1f}°"
                        st["is_record_a"] = True; st["rec_val"] = r["tmax_rec_a"]; st["rec_date"] = r.get("tmax_rec_a_date"); st["rec_type"] = "tmax"; priority.add(r["code"])
                elif r.get("tmax_rec_m") is not None and tmax >= r["tmax_rec_m"] and param != "records_absolus":
                    st["value"] = tmax; st["value_display"] = f"{tmax:.1f}°"
                    st["is_record_m"] = True; st["rec_val"] = r["tmax_rec_m"]; st["rec_date"] = r.get("tmax_rec_m_date"); st["rec_type"] = "tmax"; priority.add(r["code"])
            if st["value"] is None: continue

        elif param in ("records_tmin",):
            if tmin is None: continue
            if r.get("tmin_rec_a") is not None and tmin <= r["tmin_rec_a"]:
                st["value"] = tmin; st["value_display"] = f"{tmin:.1f}°"
                st["is_record_a"] = True; st["rec_val"] = r["tmin_rec_a"]; st["rec_date"] = r.get("tmin_rec_a_date"); st["rec_type"] = "tmin"; priority.add(r["code"])
            elif r.get("tmin_rec_m") is not None and tmin <= r["tmin_rec_m"]:
                st["value"] = tmin; st["value_display"] = f"{tmin:.1f}°"
                st["is_record_m"] = True; st["rec_val"] = r["tmin_rec_m"]; st["rec_date"] = r.get("tmin_rec_m_date"); st["rec_type"] = "tmin"; priority.add(r["code"])
            if st["value"] is None: continue

        elif param in ("records_precip",):
            if precip is None: continue
            if r.get("precip_rec_a") is not None and precip >= r["precip_rec_a"]:
                st["value"] = precip; st["value_display"] = f"{precip:.1f}mm"
                st["is_record_a"] = True; st["rec_val"] = r["precip_rec_a"]; st["rec_date"] = r.get("precip_rec_a_date"); st["rec_type"] = "precip"; priority.add(r["code"])
            elif r.get("precip_rec_m") is not None and precip >= r["precip_rec_m"]:
                st["value"] = precip; st["value_display"] = f"{precip:.1f}mm"
                st["is_record_m"] = True; st["rec_val"] = r["precip_rec_m"]; st["rec_date"] = r.get("precip_rec_m_date"); st["rec_type"] = "precip"; priority.add(r["code"])
            if st["value"] is None: continue

        elif param in ("records_gust",):
            if gust is None: continue
            if r.get("gust_rec_a") is not None and gust >= r["gust_rec_a"]:
                st["value"] = gust; st["value_display"] = f"{gust:.0f} km/h"
                st["is_record_a"] = True; st["rec_val"] = r["gust_rec_a"]; st["rec_date"] = r.get("gust_rec_a_date"); st["rec_type"] = "gust"; priority.add(r["code"])
            elif r.get("gust_rec_m") is not None and gust >= r["gust_rec_m"]:
                st["value"] = gust; st["value_display"] = f"{gust:.0f} km/h"
                st["is_record_m"] = True; st["rec_val"] = r["gust_rec_m"]; st["rec_date"] = r.get("gust_rec_m_date"); st["rec_type"] = "gust"; priority.add(r["code"])
            if st["value"] is None: continue

        else:
            continue

        # Attacher obs_date en mode période
        _od_map = {"tmax":"tmax","tmin":"tmin","precip":"precip","gust":"gust",
                   "coups_de_vent":"gust","anomalie_tmax":"tmax","anomalie_tmin":"tmin",
                   "anomalie_precip":"precip","secheresse":"precip"}
        _od_key = _od_map.get(param)
        if _od_key:
            st["obs_date"] = r.get(f"{_od_key}_obs_date")

        stations.append(st)

    # Special case: records_all combines all record types (take best per station)
    if param in ("records_all", "records_absolus", "records_mensuels"):
        seen = {}
        for st in stations:
            code = st["code"]
            if code not in seen or (st["is_record_a"] and not seen[code]["is_record_a"]):
                seen[code] = st
        stations = list(seen.values())

    # For records parameters, keep only stations with active records
    if "records" in param:
        if param == "records_absolus":
            stations = [s for s in stations if s["is_record_a"]]
        elif param == "records_mensuels":
            # Un record absolu est aussi un record mensuel par définition
            stations = [s for s in stations if s["is_record_m"] or s["is_record_a"]]
        else:
            stations = [s for s in stations if s["is_record_a"] or s["is_record_m"]]

    # Sort stations based on the parameter type (descending vs ascending)
    reverse_sort = True
    if param in ("tmin", "anomalie_tmin", "records_tmin"):
        reverse_sort = False # lowest first

    stations.sort(key=lambda s: s["value"], reverse=reverse_sort)
    
    # Juste avant le return stations à la fin de build_stations :
    seen_names = set()
    unique_stations = []
    for s in stations:
        if s["name"] not in seen_names:
            seen_names.add(s["name"])
            unique_stations.append(s)
    stations = unique_stations
    return stations

# ── Sélection de période ─────────────────────────────────────────────────────
def resolve_date_range(args):
    """Retourne (date_start, date_end, period_label, date_mode, file_suffix)."""
    if args.month:
        ym = args.month.replace("-","")
        y, m = int(ym[:4]), int(ym[4:6])
        last = _calendar.monthrange(y, m)[1]
        ds, de = f"{y}{m:02d}01", f"{y}{m:02d}{last:02d}"
        label = f"{MONTHS_FR[m].capitalize()} {y}"
        return ds, de, label, "period", ym
    elif args.date_from and args.date_to:
        ds = args.date_from.replace("-","")
        de = args.date_to.replace("-","")
        d1 = dt_date(int(ds[:4]), int(ds[4:6]), int(ds[6:]))
        d2 = dt_date(int(de[:4]), int(de[4:6]), int(de[6:]))
        if d1.month == d2.month:
            label = f"Du {d1.day} au {d2.day} {MONTHS_FR[d1.month]} {d1.year}"
        else:
            label = f"Du {d1.day} {MONTHS_FR[d1.month]} au {d2.day} {MONTHS_FR[d2.month]} {d1.year}"
        return ds, de, label, "period", f"{ds}_{de}"
    elif args.season:
        import re as _re
        m2 = _re.match(r'^(hiver|printemps|ete|automne)(\d{4})$', args.season.lower())
        if not m2:
            print(f"  ❌ Saison invalide: {args.season}  (ex: ete2026, hiver2026)"); sys.exit(1)
        sname, y = m2.group(1), int(m2.group(2))
        ds, de = SEASONS[sname](y)
        label = f"{SEASON_LABELS[sname]} {y}"
        return ds, de, label, "period", args.season.lower()
    else:
        date_str = (args.date or "").replace("-","") or (dt_date.today()-timedelta(days=1)).strftime("%Y%m%d")
        return date_str, date_str, None, "day", date_str


def load_observations_period(date_start, date_end, zone):
    """Charge toutes les observations d'une période et les agrège par station."""
    conn = get_conn()
    c = conn.cursor()
    depts = ZONE_DEPTS.get(zone)
    is_dept = zone.upper() in DEPT_NAMES or zone.isdigit() or (len(zone) == 2 and zone[0].isdigit()) or zone.lower() in ("2a", "2b")
    base_cols = ("o.date,o.station_code,s.name,s.dept,s.lat,s.lon,"
                 "o.tmax,o.tmin,o.precip,o.gust,"
                 "o.tmax_rec_m,o.tmax_rec_m_date,o.tmax_rec_a,o.tmax_rec_a_date,"
                 "o.tmin_rec_m,o.tmin_rec_m_date,o.tmin_rec_a,o.tmin_rec_a_date,"
                 "o.precip_rec_m,o.precip_rec_m_date,o.precip_rec_a,o.precip_rec_a_date,"
                 "o.gust_rec_m,o.gust_rec_m_date,o.gust_rec_a,o.gust_rec_a_date,"
                 "s.dans_tx,s.dans_fxi,s.dans_rrtn")
    if depts:
        ph = ",".join("?"*len(depts))
        c.execute(f"SELECT {base_cols} FROM observations o JOIN stations s ON o.station_code=s.code "
                  f"WHERE o.date BETWEEN ? AND ? AND s.dept IN ({ph}) ORDER BY s.code,o.date",
                  [date_start, date_end]+depts)
    elif is_dept:
        dept_code = zone.upper()
        c.execute(f"SELECT {base_cols} FROM observations o JOIN stations s ON o.station_code=s.code "
                  f"WHERE o.date BETWEEN ? AND ? AND s.dept = ? ORDER BY s.code,o.date",
                  [date_start, date_end, dept_code])
    else:
        c.execute(f"SELECT {base_cols} FROM observations o JOIN stations s ON o.station_code=s.code "
                  f"WHERE o.date BETWEEN ? AND ? ORDER BY s.code,o.date",
                  [date_start, date_end])
    col_names = ["obs_date","code","name","dept","lat","lon","tmax","tmin","precip","gust",
                 "tmax_rec_m","tmax_rec_m_date","tmax_rec_a","tmax_rec_a_date",
                 "tmin_rec_m","tmin_rec_m_date","tmin_rec_a","tmin_rec_a_date",
                 "precip_rec_m","precip_rec_m_date","precip_rec_a","precip_rec_a_date",
                 "gust_rec_m","gust_rec_m_date","gust_rec_a","gust_rec_a_date",
                 "dans_tx","dans_fxi","dans_rrtn"]
    all_rows = [{col_names[i]:r[i] for i in range(len(col_names))} for r in c.fetchall()]
    conn.close()

    # Grouper par station
    from collections import defaultdict
    by_st = defaultdict(list)
    for row in all_rows:
        by_st[row["code"]].append(row)

    aggregated = []
    for code, daily in by_st.items():
        if not daily: continue
        base = {k: daily[0][k] for k in ("code","name","dept","lat","lon","dans_tx","dans_fxi","dans_rrtn")}
        # tmax: MAX
        tx = [r for r in daily if r["tmax"] is not None]
        if tx:
            b = max(tx, key=lambda r: r["tmax"])
            base.update({k:b[k] for k in ("tmax","tmax_rec_m","tmax_rec_m_date","tmax_rec_a","tmax_rec_a_date")})
            base["tmax_obs_date"] = b["obs_date"]
        else:
            for k in ("tmax","tmax_rec_m","tmax_rec_m_date","tmax_rec_a","tmax_rec_a_date"): base[k]=None
            base["tmax_obs_date"] = None
        # tmin: MIN
        tn = [r for r in daily if r["tmin"] is not None]
        if tn:
            b = min(tn, key=lambda r: r["tmin"])
            base.update({k:b[k] for k in ("tmin","tmin_rec_m","tmin_rec_m_date","tmin_rec_a","tmin_rec_a_date")})
            base["tmin_obs_date"] = b["obs_date"]
        else:
            for k in ("tmin","tmin_rec_m","tmin_rec_m_date","tmin_rec_a","tmin_rec_a_date"): base[k]=None
            base["tmin_obs_date"] = None
        # precip: CUMUL + date du pic journalier
        pr = [r for r in daily if r["precip"] is not None]
        if pr:
            base["precip"] = round(sum(r["precip"] for r in pr), 1)
            b = max(pr, key=lambda r: r["precip"])
            base.update({k:b[k] for k in ("precip_rec_m","precip_rec_m_date","precip_rec_a","precip_rec_a_date")})
            base["precip_obs_date"] = b["obs_date"]
        else:
            for k in ("precip","precip_rec_m","precip_rec_m_date","precip_rec_a","precip_rec_a_date"): base[k]=None
            base["precip_obs_date"] = None
        # gust: MAX
        gu = [r for r in daily if r["gust"] is not None]
        if gu:
            b = max(gu, key=lambda r: r["gust"])
            base.update({k:b[k] for k in ("gust","gust_rec_m","gust_rec_m_date","gust_rec_a","gust_rec_a_date")})
            base["gust_obs_date"] = b["obs_date"]
        else:
            for k in ("gust","gust_rec_m","gust_rec_m_date","gust_rec_a","gust_rec_a_date"): base[k]=None
            base["gust_obs_date"] = None
        aggregated.append(base)
    return aggregated


def build_bilan_jour(rows):
    """Construit le payload des 4 quadrants pour la carte Bilan du Jour."""
    quads = []
    for param, theme, label, icon in [
        ("tmax",   "hot",  "TEMPÉRATURE MAXIMALE",   "🌡️"),
        ("tmin",   "cold", "TEMPÉRATURE MINIMALE",   "🧊"),
        ("precip", "rain", "CUMUL DE PRÉCIPITATIONS", "🌧️"),
        ("gust",   "wind", "RAFALES MAXIMALES",      "💨"),
    ]:
        sts = build_stations(rows, param, 0)
        if sts:
            top = sts[0]
            quads.append({
                "param":     param,
                "theme":     theme,
                "label":     label,
                "icon":      icon,
                "name":      top["name"],
                "dept":      top["dept"],
                "value":     top["value"],
                "value_disp":top["value_display"],
                "is_record_a":top.get("is_record_a",False),
                "is_record_m":top.get("is_record_m",False),
                "obs_date":  top.get("obs_date"),
            })
    return quads


# ── HTTP server ───────────────────────────────────────────────────────────────
save_done_event = threading.Event()
saved_image_data = {}

class MapHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, *args): pass  # silence

    def do_GET(self):
        path = self.path.split("?")[0]
        filepath = os.path.join(PROJECT_DIR, path.lstrip("/"))
        if os.path.isfile(filepath):
            ext = os.path.splitext(filepath)[1].lower()
            ct = {"html":"text/html","js":"application/javascript","css":"text/css",
                  "json":"application/json","png":"image/png"}.get(ext.lstrip("."), "application/octet-stream")
            with open(filepath,"rb") as f: data = f.read()
            self.send_response(200)
            self.send_header("Content-Type", ct)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Access-Control-Allow-Origin","*")
            self.end_headers()
            self.wfile.write(data)
        else:
            self.send_response(404); self.end_headers()

    def do_POST(self):
        if self.path == "/save_map":
            length = int(self.headers.get("Content-Length",0))
            body = self.rfile.read(length)
            try:
                payload = json.loads(body)
                img_b64 = payload["image"].split(",")[1]
                saved_image_data["data"] = base64.b64decode(img_b64)
                self.send_response(200)
                self.send_header("Content-Type","application/json")
                self.send_header("Access-Control-Allow-Origin","*")
                self.end_headers()
                self.wfile.write(b'{"status":"ok"}')
                save_done_event.set()
            except Exception as e:
                print(f"  [server] Error: {e}")
                self.send_response(500); self.end_headers()
        else:
            self.send_response(404); self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin","*")
        self.send_header("Access-Control-Allow-Methods","GET,POST,OPTIONS")
        self.end_headers()

def run_server():
    os.chdir(PROJECT_DIR)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), MapHandler) as httpd:
        httpd.serve_forever()

# ── Chrome render ─────────────────────────────────────────────────────────────
def render_one(param, orientation, filepath, mm="0"):
    url = f"http://127.0.0.1:{PORT}/index_meteociel.html?orientation={orientation}&mm={mm}"
    w, h = (1080, 1920) if orientation == "portrait" else (1920, 1080)
    
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch()
            context = browser.new_context(viewport={"width": w, "height": h})
            page = context.new_page()
            page.goto(url)
            page.wait_for_timeout(1500)
            el = page.locator("#capture-area")
            el.screenshot(path=filepath)
            browser.close()
        return True
    except Exception as e:
        print(f"  ❌ Error rendering with Playwright: {e}")
        return False

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Cartes observations Météociel (Phase 2)")
    # Date / période
    parser.add_argument("--date",    default=None, help="Date YYYYMMDD (défaut: hier)")
    parser.add_argument("--month",   default=None, help="Mois entier YYYYMM (ex: 202607)")
    parser.add_argument("--from",    dest="date_from", default=None, help="Début période YYYYMMDD")
    parser.add_argument("--to",      dest="date_to",   default=None, help="Fin période YYYYMMDD")
    parser.add_argument("--season",  default=None, help="Saison (ex: ete2026, hiver2026)")
    # Zone / paramètre
    parser.add_argument("--zone",    default="france", help="Zone géographique ou numéro de département (ex: france, hdf, npdc, 59, 62...)")
    parser.add_argument("--param",   default=None, help="Paramètre(s) séparés par virgule")
    parser.add_argument("--pack",    default=None, choices=["all"])
    parser.add_argument("--orientation", default="both", choices=["landscape","portrait","both"])
    # Filtres de valeur
    parser.add_argument("--min-value", dest="min_value", default=None, help="Seuil minimum (ex: 30)")
    parser.add_argument("--max-value", dest="max_value", default=None, help="Seuil maximum (ex: 20)")
    parser.add_argument("--top",       type=int, default=10, help="Nombre de stations à afficher (défaut: 10)")
    # Options de rendu
    parser.add_argument("--monsieur-meteo", dest="monsieur_meteo", action="store_true",
                        help="Utiliser les fonds et logo Monsieur Météo")
    args = parser.parse_args()

    # ── Résoudre la plage de dates ──
    date_start, date_end, period_label, date_mode, file_suffix = resolve_date_range(args)
    date_str = date_start  # compat affichage

    # ── Paramètres à rendre ──
    ALL_PARAMS_PLUS = ALL_PARAMS + ["bilan_jour"]
    if args.pack == "all":
        params_to_render = ALL_PARAMS
    elif args.param:
        params_to_render = [p.strip() for p in args.param.split(",") if p.strip() in ALL_PARAMS_PLUS]
        if not params_to_render:
            print(f"Paramètre inconnu. Disponibles: {', '.join(ALL_PARAMS_PLUS)}"); return
    else:
        params_to_render = ["tmax"]

    orientations = ["landscape","portrait"] if args.orientation == "both" else [args.orientation]
    min_val = float(args.min_value) if args.min_value else None
    max_val = float(args.max_value) if args.max_value else None

    # ── Résolution de la zone (région, département, ou nationale) ──
    is_dept = args.zone.upper() in DEPT_NAMES or args.zone.isdigit() or (len(args.zone) == 2 and args.zone[0].isdigit()) or args.zone.lower() in ("2a", "2b")
    if is_dept:
        dept_code = args.zone.upper()
        dept_name = DEPT_NAMES.get(dept_code, f"Département {dept_code}")
        zone_label = f"{dept_name} ({dept_code})"
    else:
        zone_label = ZONE_LABELS.get(args.zone, args.zone)

    print("═"*65)
    print(f"  PHASE 2 — Cartes Météociel")
    if date_mode == "period":
        print(f"  Période : {period_label}")
        print(f"  Du {date_start} au {date_end}")
    else:
        print(f"  Date  : {date_fr(date_str)} ({date_str})")
    print(f"  Zone  : {zone_label}")
    print(f"  Params: {', '.join(params_to_render)}")
    print(f"  Format: {args.orientation}")
    if min_val is not None: print(f"  Seuil : ≥ {min_val}")
    if max_val is not None: print(f"  Seuil : ≤ {max_val}")
    if args.top != 10:       print(f"  Top   : {args.top} stations")
    if args.monsieur_meteo:  print(f"  Mode  : Monsieur Météo 🎙️")
    print("═"*65)

    # ── Charger les observations ──
    print(f"\n  📊 Lecture SQLite…")
    if date_mode == "period":
        rows = load_observations_period(date_start, date_end, args.zone)
    else:
        rows = load_observations(date_str, args.zone)
    if not rows:
        print(f"  ❌ Aucune donnée pour {date_start}→{date_end} / {args.zone}.")
        if date_mode == "day":
            print(f"     Lancez d'abord: python update_daily_obs.py --date {date_str}")
        return
    print(f"  ✅ {len(rows)} stations chargées")

    if is_dept:
        dept_code = args.zone.upper()
        lats = [r["lat"] for r in rows if r.get("lat") is not None and r.get("dept") == dept_code]
        lons = [r["lon"] for r in rows if r.get("lon") is not None and r.get("dept") == dept_code]
        if lats and lons:
            center_lat = sum(lats) / len(lats)
            center_lon = sum(lons) / len(lons)
        else:
            center_lat, center_lon = 46.5, 2.5
        zone_cfg = {
            "center": [center_lat, center_lon],
            "zoom": 9,
            "zoom_portrait": 9,
            "min_dist": 10,
            "max_st": 15
        }
    else:
        zone_cfg = ZONE_MAP.get(args.zone, ZONE_MAP["france"])

    # ── Copier les fonds ──
    src_dir = os.path.join(PROJECT_DIR, "A_CONSERVER_ABSOLUMENT")
    if not os.path.exists(src_dir):
        src_dir = r"C:\Users\grego\Desktop\cartes_alertes\A_CONSERVER_ABSOLUMENT"
    for src_name, dst_name in [("VIGILANCE PORTRAIT.png","bg_portrait.png"),("VIGILANCE PAYSAGE.png","bg_landscape.png")]:
        src = os.path.join(src_dir, src_name)
        if os.path.exists(src):
            shutil.copyfile(src, os.path.join(PROJECT_DIR, dst_name))

    # ── Fonds Monsieur Météo ──
    MM_DIR = r"C:\Users\grego\Documents\METEO_CLIMAT\monsieur_meteo"
    if args.monsieur_meteo:
        for src_name, dst_name in [
            ("MONSIEUR METEO VERSION TIKTOK.png", "bg_portrait_mm.png"),
            ("MONSIEUR METEO VERSION PAYSAGE.png","bg_landscape_mm.png"),
            ("LOGO MONSIEUR METEO.png",           "logo_mm.png"),
        ]:
            src = os.path.join(MM_DIR, src_name)
            if os.path.exists(src):
                shutil.copyfile(src, os.path.join(PROJECT_DIR, dst_name))

    # ── Serveur local ──
    t = threading.Thread(target=run_server, daemon=True)
    t.start()
    time.sleep(1.5)
    print(f"  🌐 Serveur local démarré sur port {PORT}\n")

    dest = os.path.join(DEST_DIR, "mm") if args.monsieur_meteo else DEST_DIR
    os.makedirs(dest, exist_ok=True)
    mm_flag = "1" if args.monsieur_meteo else "0"

    generated, errors = [], []
    total = len(params_to_render) * len(orientations)
    n = 0

    for param in params_to_render:
        # ── Construire les données ──
        if param == "bilan_jour":
            payload = build_bilan_jour(rows)
            if not payload:
                print(f"  ⚠️  bilan_jour                Aucune donnée — ignoré"); continue
        else:
            stations = build_stations(rows, param, 0)
            if min_val is not None:
                stations = [s for s in stations if s["value"] is not None and s["value"] >= min_val]
            if max_val is not None:
                stations = [s for s in stations if s["value"] is not None and s["value"] <= max_val]
            stations = stations[:args.top]
            # Éviter de générer des cartes "Pluies diluviennes" s'il ne pleut pas
            if param == "precip" and len(stations) > 0:
                max_val_param = stations[0]["value"]
                if max_val_param < 1.0: # Moins de 1 mm
                    print(f"  ⚠️  {param:<25} Cumuls trop faibles ({max_val_param} mm) — carte ignorée")
                    continue
            # Éviter de générer des cartes de rafales si le vent est faible
            if param == "gust" and len(stations) > 0:
                max_val_param = stations[0]["value"]
                if max_val_param < 50.0: # Moins de 50 km/h
                    print(f"  ⚠️  {param:<25} Vent trop faible ({max_val_param} km/h) — carte ignorée")
                    continue
            if not stations:
                fmsg = f" (aucune station ≥{min_val})" if min_val else (f" (aucune station ≤{max_val})" if max_val else "")
                print(f"  ⚠️  {param:<25} Aucune station avec données{fmsg} — ignoré"); continue
            payload = stations

        for orientation in orientations:
            n += 1

            # Construire le label de seuil avec unité
            unit_suffix = ""
            if param in ("tmax", "tmin", "anomalie_tmax", "anomalie_tmin", "amplitude", "tmoy", "records_tmax", "records_tmin"):
                unit_suffix = "°C"
            elif param in ("precip", "anomalie_precip", "records_precip"):
                unit_suffix = " mm"
            elif param in ("gust", "coups_de_vent", "records_gust"):
                unit_suffix = " km/h"

            filter_label = None
            if min_val is not None and max_val is not None:
                filter_label = f"Entre {min_val} et {max_val}{unit_suffix}"
            elif min_val is not None:
                filter_label = f"≥ {min_val}{unit_suffix}"
            elif max_val is not None:
                filter_label = f"≤ {max_val}{unit_suffix}"

            # Compter tous les records du jour dans la SQLite pour la bannière du bilan
            nb_rec_a, nb_rec_m = 0, 0
            # On cherche les records sur les 4 paramètres dans toutes les lignes de la DB pour ce jour
            for r in rows:
                if (r.get("tmax") and r.get("tmax_rec_a") and r["tmax"] >= r["tmax_rec_a"]): nb_rec_a += 1
                elif (r.get("tmax") and r.get("tmax_rec_m") and r["tmax"] >= r["tmax_rec_m"]): nb_rec_m += 1
                
                if (r.get("tmin") and r.get("tmin_rec_a") and r["tmin"] <= r["tmin_rec_a"]): nb_rec_a += 1
                elif (r.get("tmin") and r.get("tmin_rec_m") and r["tmin"] <= r["tmin_rec_m"]): nb_rec_m += 1
                
                if (r.get("precip") and r.get("precip_rec_a") and r["precip"] >= r["precip_rec_a"]): nb_rec_a += 1
                elif (r.get("precip") and r.get("precip_rec_m") and r["precip"] >= r["precip_rec_m"]): nb_rec_m += 1
                
                if (r.get("gust") and r.get("gust_rec_a") and r["gust"] >= r["gust_rec_a"]): nb_rec_a += 1
                elif (r.get("gust") and r.get("gust_rec_m") and r["gust"] >= r["gust_rec_m"]): nb_rec_m += 1

            data = {
                "date":         date_str,
                "date_fr":      period_label if date_mode == "period" else date_fr(date_str),
                "date_start":   date_start,
                "date_end":     date_end,
                "period_label": period_label,
                "date_mode":    date_mode,
                "zone":         args.zone,
                "zone_label":   zone_label,
                "param":        param,
                "param_label":  PARAM_LABELS.get(param, param),
                "stations":     payload,
                "filter_label": filter_label,
                "monsieur_meteo": args.monsieur_meteo,
                "nb_records_a":  nb_rec_a,
                "nb_records_m":  nb_rec_m,
                "map_config": {
                    "center":        zone_cfg["center"],
                    "zoom":          zone_cfg["zoom"],
                    "zoom_portrait": zone_cfg["zoom_portrait"],
                }
            }
            with open(DATA_JSON, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False)

            # Nom de fichier
            parts = []
            if min_val is not None: parts.append(f"gte{int(min_val)}")
            if max_val is not None: parts.append(f"lte{int(max_val)}")
            if orientation == "portrait": parts.append("portrait")
            suffix = ("_" + "_".join(parts)) if parts else ""
            # Clean region names for filenames
            zone_clean_names = {
                "france": "France",
                "hdf": "Hauts-de-France",
                "npdc": "Nord-Pas-de-Calais",
                "normandie": "Normandie",
                "idf": "Ile-de-France",
                "ges": "Grand-Est",
                "ara": "Auvergne-Rhone-Alpes",
                "naq": "Nouvelle-Aquitaine",
                "occ": "Occitanie",
                "paca": "PACA",
                "bfc": "Bourgogne-Franche-Comte",
                "bre": "Bretagne",
                "pdl": "Pays-de-la-Loire",
                "cvl": "Centre-Val-de-Loire",
                "cor": "Corse"
            }
            clean_zone_name = zone_clean_names.get(args.zone.lower(), args.zone)
            filename = f"carte_obs_{clean_zone_name}_{param}_{file_suffix}{suffix}.jpg"
            filepath = os.path.join(dest, filename)

            print(f"  [{n:2d}/{total}] {param:<25} {orientation:<10} ", end="", flush=True)
            ok = render_one(param, orientation, filepath, mm=mm_flag)
            if ok:
                print(f"✅  → {filename}")
                generated.append(filepath)
            else:
                print(f"❌  Error")
                errors.append((param, orientation))

    # ── Résumé ──
    print()
    print("═"*65)
    print(f"  TERMINÉ")
    print(f"  ✅ {len(generated)} cartes générées")
    if errors: print(f"  ❌ {len(errors)} erreurs: {errors}")
    print(f"  📂 {dest}")

    if "records_all" in params_to_render:
        recs = [s for s in build_stations(rows,"records_all",0) if s.get("is_record_a") or s.get("is_record_m")]
        if recs:
            print(f"\n  🏆 Records détectés : {len(recs)} stations")
            for s in sorted(recs, key=lambda x: x.get("dept","")):
                rt = s.get("rec_type","?"); rtype = "R.ABS" if s["is_record_a"] else "R.MENS"
                print(f"     [{s['dept']}] {s['name']:<30} {rt.upper():<6} {s['value_display']:<10} {rtype} (anc: {s['rec_val']} — {s['rec_date']})")
    print("═"*65)

if __name__ == "__main__":
    main()
