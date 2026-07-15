import os
import sqlite3
import re
import urllib.request
import urllib.parse
import gzip
import math
import csv
import json
from datetime import datetime
import concurrent.futures

current_dir = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(current_dir, "data")
DB_PATH_LOCAL = os.path.join(DATA_DIR, "meteo_data.db")
TIMEOUT = 15
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

OFFICIAL_ID_MAP = {}
STATION_TO_ID = {}
METEOCIEL_ID_MAP = {}

try:
    with open(os.path.join(DATA_DIR, "rankNameToId.json"), encoding="utf-8") as f:
        OFFICIAL_ID_MAP = json.load(f)
except: pass

try:
    with open(os.path.join(DATA_DIR, "stationNames.json"), encoding="utf-8") as f:
        st_names = json.load(f)
        STATION_TO_ID = {name.upper(): code for code, name in st_names.items()}
except: pass

try:
    with open(os.path.join(DATA_DIR, "rankStations.json"), encoding="utf-8") as f:
        METEOCIEL_ID_MAP = json.load(f)
except: pass

def get_db_path():
    if os.path.exists(DB_PATH_LOCAL):
        return DB_PATH_LOCAL
    DB_PATH_GLOBAL = r"C:\Users\grego\.gemini\config\skills\meteo\data\meteo_data.db"
    if os.path.exists(DB_PATH_GLOBAL):
        return DB_PATH_GLOBAL
    return r"C:\Users\grego\Documents\METEO_CLIMAT\data\meteo_data.db"

def get_conn():
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE observations ADD COLUMN sun REAL")
        conn.commit()
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS geocoding_cache (
            query TEXT PRIMARY KEY,
            label TEXT,
            lat REAL,
            lon REAL,
            postcode TEXT
        );
        """)
        conn.commit()
    except sqlite3.OperationalError:
        pass
    return conn

def get_station(code):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT code, name, dept, lat, lon, alt, dans_tx, dans_fxi, dans_rrtn FROM stations WHERE code = ?", (code,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "code": row[0], "name": row[1], "dept": row[2],
            "lat": row[3], "lon": row[4], "alt": row[5],
            "dans_tx": row[6], "dans_fxi": row[7], "dans_rrtn": row[8]
        }
    return None

def get_all_stations(only_dans_tx=False):
    conn = get_conn()
    cursor = conn.cursor()
    if only_dans_tx:
        cursor.execute("SELECT code, name, dept, lat, lon, alt, dans_tx, dans_fxi, dans_rrtn FROM stations WHERE dans_tx = 'Oui'")
    else:
        cursor.execute("SELECT code, name, dept, lat, lon, alt, dans_tx, dans_fxi, dans_rrtn FROM stations")
    rows = cursor.fetchall()
    conn.close()
    return [{
        "code": r[0], "name": r[1], "dept": r[2],
        "lat": r[3], "lon": r[4], "alt": r[5],
        "dans_tx": r[6], "dans_fxi": r[7], "dans_rrtn": r[8]
    } for r in rows]

def get_normales_records(code, month):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT tmax_norm, tmean_norm, tmin_norm, precip_norm, sun_norm,
           tmax_rec_val, tmax_rec_date, tmin_rec_val, tmin_rec_date, precip_rec_val, precip_rec_date
    FROM normales_records WHERE station_code = ? AND month = ?
    """, (code, month))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "tmax_norm": row[0], "tmean_norm": row[1], "tmin_norm": row[2], "precip_norm": row[3], "sun_norm": row[4],
            "tmax_rec_val": row[5], "tmax_rec_date": row[6],
            "tmin_rec_val": row[7], "tmin_rec_date": row[8],
            "precip_rec_val": row[9], "precip_rec_date": row[10]
        }
    return None

def haversine(la1, lo1, la2, lo2):
    R = 6371
    la1, lo1, la2, lo2 = (math.radians(x) for x in [la1, lo1, la2, lo2])
    return R * 2 * math.asin(math.sqrt(math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2))

def get_normales_records_with_proxy(code, month):
    nr = get_normales_records(code, month)
    if nr and nr["tmax_norm"] is not None:
        return nr, None
        
    s = get_station(code)
    if not s or s["lat"] is None:
        return None, None
        
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT DISTINCT station_code FROM normales_records 
    WHERE month = ? AND tmax_norm IS NOT NULL
    """, (month,))
    valid_codes = [r[0] for r in cursor.fetchall()]
    conn.close()
    
    best = None
    for vc in valid_codes:
        s2 = get_station(vc)
        if not s2 or s2["lat"] is None: continue
        d = haversine(s["lat"], s["lon"], s2["lat"], s2["lon"])
        if best is None or d < best[0]:
            best = (d, vc, s2["name"])
            
    if best:
        d, vc, name = best
        nr_proxy = get_normales_records(vc, month)
        proxy_info = {"code": vc, "name": name, "distance_km": round(d, 1)}
        return nr_proxy, proxy_info
        
    return None, None

def save_observation(code, date, tmax, tmin, precip, gust, sun=None,
                     tmax_rec_m=None, tmax_rec_m_date=None, tmax_rec_a=None, tmax_rec_a_date=None,
                     tmin_rec_m=None, tmin_rec_m_date=None, tmin_rec_a=None, tmin_rec_a_date=None,
                     precip_rec_m=None, precip_rec_m_date=None, precip_rec_a=None, precip_rec_a_date=None,
                     gust_rec_m=None, gust_rec_m_date=None, gust_rec_a=None, gust_rec_a_date=None):
    date_clean = date.replace("-", "").strip()
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO observations (
        station_code, date, tmax, tmin, precip, gust, sun,
        tmax_rec_m, tmax_rec_m_date, tmax_rec_a, tmax_rec_a_date,
        tmin_rec_m, tmin_rec_m_date, tmin_rec_a, tmin_rec_a_date,
        precip_rec_m, precip_rec_m_date, precip_rec_a, precip_rec_a_date,
        gust_rec_m, gust_rec_m_date, gust_rec_a, gust_rec_a_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (code, date_clean, tmax, tmin, precip, gust, sun,
          tmax_rec_m, tmax_rec_m_date, tmax_rec_a, tmax_rec_a_date,
          tmin_rec_m, tmin_rec_m_date, tmin_rec_a, tmin_rec_a_date,
          precip_rec_m, precip_rec_m_date, precip_rec_a, precip_rec_a_date,
          gust_rec_m, gust_rec_m_date, gust_rec_a, gust_rec_a_date))
    conn.commit()
    conn.close()

def get_observation(code, date):
    date_clean = date.replace("-", "").strip()
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT tmax, tmin, precip, gust, sun,
           tmax_rec_m, tmax_rec_m_date, tmax_rec_a, tmax_rec_a_date,
           tmin_rec_m, tmin_rec_m_date, tmin_rec_a, tmin_rec_a_date,
           precip_rec_m, precip_rec_m_date, precip_rec_a, precip_rec_a_date,
           gust_rec_m, gust_rec_m_date, gust_rec_a, gust_rec_a_date
    FROM observations WHERE station_code = ? AND date = ?
    """, (code, date_clean))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "tmax": row[0], "tmin": row[1], "precip": row[2], "gust": row[3], "sun": row[4],
            "tmax_rec_m": row[5], "tmax_rec_m_date": row[6], "tmax_rec_a": row[7], "tmax_rec_a_date": row[8],
            "tmin_rec_m": row[9], "tmin_rec_m_date": row[10], "tmin_rec_a": row[11], "tmin_rec_a_date": row[12],
            "precip_rec_m": row[13], "precip_rec_m_date": row[14], "precip_rec_a": row[15], "precip_rec_a_date": row[16],
            "gust_rec_m": row[17], "gust_rec_m_date": row[18], "gust_rec_a": row[19], "gust_rec_a_date": row[20]
        }
    return None

def import_from_csv(csv_path):
    print(f"Importation des relevés depuis {csv_path}...")
    import_count = 0
    with open(csv_path, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            p = row["POSTE"].strip()
            date = row["DATE"].strip()
            
            def clean_float(val):
                if not val or val.strip() in ("", "---", "ND", "None"): return None
                try: return float(val.strip().replace(",", "."))
                except: return None
                
            tmax = clean_float(row.get("TX"))
            tmin = clean_float(row.get("TN"))
            precip = clean_float(row.get("RR"))
            gust = clean_float(row.get("FXI"))
            sun = clean_float(row.get("INST"))
            
            save_observation(p, date, tmax, tmin, precip, gust, sun)
            import_count += 1
            
    print(f"  {import_count} observations importées ou mises à jour.")

def clean_val(val):
    if not val: return None
    val = val.replace("&nbsp;", "").strip()
    if val in ("---", "", "ND", "aucune"): return 0.0 if "aucune" in val else None
    if "tr" in val.lower() or "trace" in val.lower(): return 0.0
    val = re.sub(r'(km/h|km)', '', val, flags=re.I)
    val = re.sub(r'(&deg;C|&deg;|°C|°|Â°|C|mm|h|\s|hPa)', '', val)
    try: return float(val)
    except ValueError: return None

def fetch_html(path):
    req = urllib.request.Request(
        f"https://www.meteociel.fr{path}",
        headers={"User-Agent": USER_AGENT, "Accept-Encoding": "gzip"}
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        if r.info().get('Content-Encoding') == 'gzip':
            raw = gzip.decompress(r.read())
        else:
            raw = r.read()
    for enc in ("utf-8", "iso-8859-1", "windows-1252"):
        try: return raw.decode(enc)
        except: pass
    return raw.decode("utf-8", errors="replace")

def parse_clim_day(html, target_day):
    m = re.search(r"<table[^>]*cellpadding=2[^>]*border=1[^>]*>([\s\S]*?)</table>", html, re.I)
    if not m: return None
    rows = re.findall(r"<tr[^>]*>([\s\S]*?)</tr>", m.group(1), re.I)
    if len(rows) < 2: return None
    heads = [re.sub(r"<[^>]+>","",c).replace("&nbsp;","").replace("&deg;","").strip().lower()
             for c in re.findall(r"<td[^>]*>([\s\S]*?)</td>", rows[0], re.I)]
    col = {}
    for i,h in enumerate(heads):
        if "jour"  in h: col["day"]   = i
        elif "max" in h: col["tmax"]  = i
        elif "min" in h: col["tmin"]  = i
        elif any(k in h for k in ("pr","rr","plu")): col["precip"] = i
        elif any(k in h for k in ("ens","sol")):     col["sun"]    = i
    
    for row in rows[1:]:
        cells = re.findall(r"<td[^>]*>([\s\S]*?)</td>", row, re.I)
        if len(cells) < 2: continue
        dn = re.search(r"\d+", re.sub(r"<[^>]+>","", cells[col.get("day",0)]))
        if not dn: continue
        day = int(dn.group(0))
        if day == target_day:
            e = {"day": day}
            for f in ("tmax","tmin","precip","sun"):
                if f in col: e[f] = clean_val(re.sub(r"<[^>]+>", "", cells[col[f]]))
            return e
    return None

def parse_hourly_obs(html):
    tables = re.findall(r"<table[^>]*>([\s\S]*?)</table>", html, re.I)
    target_table = None
    for t in tables:
        if "Heure" in t and ("Temp" in t or "Vent" in t) and "Humi" in t:
            target_table = t
            break
    if not target_table: return []
    rows = re.findall(r"<tr[^>]*>([\s\S]*?)</tr>", target_table, re.I)
    if len(rows) < 2: return []
    
    obs_list = []
    for r in rows[1:]:
        cells = re.findall(r"<td[^>]*>([\s\S]*?)</td>", r, re.I)
        if len(cells) < 4: continue
        
        row_data = {}
        hour_txt = re.sub(r"<[^>]+>", "", cells[0]).strip()
        row_data["hour"] = hour_txt

        # Auto-detect T°C, Humi%, gust, precip by scanning all cells
        for i, cell in enumerate(cells):
            if "temp" not in row_data:
                m = re.search(r"([\-\d\.]+)\s*(?:&deg;|°)?C", cell)
                if m:
                    row_data["temp"] = float(m.group(1))
            if "humi" not in row_data:
                m = re.search(r"([\d\.]+)\s*%", cell)
                if m:
                    row_data["humi"] = float(m.group(1))
            # Gust: look for "Rafales max : XX km/h" or "XX km/h  (YY km/h)"
            if "gust" not in row_data:
                m = re.search(r"Rafales\s*max\s*:\s*([\d\.]+)\s*km/h", cell, re.I)
                if m:
                    row_data["gust"] = float(m.group(1))
                    # Also try to capture avg wind from same cell
                    m2 = re.search(r"Vent\s*moyen\s*:\s*([\d\.]+)\s*km/h", cell, re.I)
                    if m2: row_data["wind_avg"] = float(m2.group(1))
                else:
                    # Fallback: "NN km/h  (MM km/h)" format → avg=NN, gust=MM
                    m2 = re.search(r"([\d\.]+)\s*km/h\s+\(([\d\.]+)\s*km/h\)", cell)
                    if m2:
                        row_data["wind_avg"] = float(m2.group(1))
                        row_data["gust"] = float(m2.group(2))
            if "precip" not in row_data:
                if "aucune" in cell.lower():
                    row_data["precip"] = 0.0
                else:
                    m = re.search(r"([\d\.]+)\s*mm", cell, re.I)
                    if m: row_data["precip"] = float(m.group(1))
                    
        if "wind_avg" not in row_data:
            row_data["wind_avg"] = 0.0
        if "gust" not in row_data:
            row_data["gust"] = 0.0
        if "precip" not in row_data:
            row_data["precip"] = 0.0
                
        obs_list.append(row_data)
    return obs_list


def _fetch_mode_data(key, mode_id, day, month, year):
    url = f"/obs/classement.php?archive=1&ua=1&all=1&mode={mode_id}&pays=&ud=0&dec=0&alt=0&u2=1&ma=0&jour={day}&mois={month}&annee={year}&record=1&sub=OK"
    try:
        html = fetch_html(url)
        rows = re.findall(r"<tr[^>]*>([\s\S]*?)</tr>", html, re.I)
        results = []
        for r in rows:
            if "table" in r.lower(): continue
            m_link = re.search(r"<a[^>]*code2=(\d+)[^>]*>([\s\S]*?)</a>", r, re.I)
            if m_link:
                raw_code = m_link.group(1).strip()
                station_full = re.sub(r"<[^>]+>", "", m_link.group(2)).strip()
                
                m_dept = re.search(r"^(.*)\s\((.*)\)$", station_full)
                station = m_dept.group(1).strip() if m_dept else station_full
                
                resolved_id = None
                if station_full in OFFICIAL_ID_MAP:
                    resolved_id = OFFICIAL_ID_MAP[station_full]
                elif station.upper() in STATION_TO_ID:
                    resolved_id = STATION_TO_ID[station.upper()]
                elif station_full in METEOCIEL_ID_MAP:
                    resolved_id = METEOCIEL_ID_MAP[station_full]
                    
                if not resolved_id:
                    resolved_id = raw_code
                    
                if resolved_id and str(resolved_id).isdigit():
                    id_str = str(resolved_id)
                    if len(id_str) == 7 and id_str[0] != '0':
                        id_str = '0' + id_str
                    resolved_id = id_str
                    
                cells = re.findall(r"<td[^>]*>([\s\S]*?)</td>", r, re.I)
                cells_clean = [re.sub(r"<[^>]+>", "", c).replace("&nbsp;", "").strip() for c in cells]
                
                val_obs = clean_val(cells_clean[1]) if len(cells_clean) > 1 else None
                rec_m_val = clean_val(cells_clean[2]) if len(cells_clean) > 2 else None
                rec_m_date = cells_clean[3] if len(cells_clean) > 3 and cells_clean[3] else None
                rec_a_val = clean_val(cells_clean[4]) if len(cells_clean) > 4 else None
                rec_a_date = cells_clean[5] if len(cells_clean) > 5 and cells_clean[5] else None
                
                if val_obs is not None and resolved_id:
                    results.append((resolved_id, {
                        "val": val_obs,
                        "rec_m": rec_m_val,
                        "rec_m_date": rec_m_date,
                        "rec_a": rec_a_val,
                        "rec_a_date": rec_a_date
                    }))
        return key, results
    except Exception as e:
        print(f"Erreur de récupération des données {key} : {e}")
        return key, []

def scrape_national_archive(date_str):
    dt = datetime.strptime(date_str, "%Y%m%d")
    day, month, year = dt.day, dt.month, dt.year
    
    # Modes for daily rankings (excluding sun since mode 13 has no daily archives on classement.php)
    modes = {
        "tmax": "25",
        "tmin": "26",
        "gust": "27",
        "precip": "28"
    }
    
    obs_map = {}
    print(f"Téléchargement concurrent de toutes les archives nationales Météociel pour le {day:02d}/{month:02d}/{year} (avec records)...")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(_fetch_mode_data, key, mode_id, day, month, year): key for key, mode_id in modes.items()}
        for future in concurrent.futures.as_completed(futures):
            key = futures[future]
            _, results = future.result()
            for code, data in results:
                if code not in obs_map:
                    obs_map[code] = {
                        "tmax": None, "tmax_rec_m": None, "tmax_rec_m_date": None, "tmax_rec_a": None, "tmax_rec_a_date": None,
                        "tmin": None, "tmin_rec_m": None, "tmin_rec_m_date": None, "tmin_rec_a": None, "tmin_rec_a_date": None,
                        "precip": None, "precip_rec_m": None, "precip_rec_m_date": None, "precip_rec_a": None, "precip_rec_a_date": None,
                        "gust": None, "gust_rec_m": None, "gust_rec_m_date": None, "gust_rec_a": None, "gust_rec_a_date": None,
                        "sun": None
                    }
                obs_map[code][key] = data["val"]
                obs_map[code][f"{key}_rec_m"] = data["rec_m"]
                obs_map[code][f"{key}_rec_m_date"] = data["rec_m_date"]
                obs_map[code][f"{key}_rec_a"] = data["rec_a"]
                obs_map[code][f"{key}_rec_a_date"] = data["rec_a_date"]
                
    conn = get_conn()
    cursor = conn.cursor()
    for code, obs in obs_map.items():
        cursor.execute("""
        INSERT OR REPLACE INTO observations (
            station_code, date, tmax, tmin, precip, gust, sun,
            tmax_rec_m, tmax_rec_m_date, tmax_rec_a, tmax_rec_a_date,
            tmin_rec_m, tmin_rec_m_date, tmin_rec_a, tmin_rec_a_date,
            precip_rec_m, precip_rec_m_date, precip_rec_a, precip_rec_a_date,
            gust_rec_m, gust_rec_m_date, gust_rec_a, gust_rec_a_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (code, date_str, obs["tmax"], obs["tmin"], obs["precip"], obs["gust"], obs["sun"],
              obs["tmax_rec_m"], obs["tmax_rec_m_date"], obs["tmax_rec_a"], obs["tmax_rec_a_date"],
              obs["tmin_rec_m"], obs["tmin_rec_m_date"], obs["tmin_rec_a"], obs["tmin_rec_a_date"],
              obs["precip_rec_m"], obs["precip_rec_m_date"], obs["precip_rec_a"], obs["precip_rec_a_date"],
              obs["gust_rec_m"], obs["gust_rec_m_date"], obs["gust_rec_a"], obs["gust_rec_a_date"]))
    conn.commit()
    conn.close()
    
    print(f"  Base de données locale mise à jour : {len(obs_map)} stations enregistrées pour le {date_str}.")
    return obs_map

def fetch_and_cache(code, date_str):
    cached = get_observation(code, date_str)
    if cached and (cached["tmax"] is not None or cached["precip"] is not None):
        return cached
        
    scrape_national_archive(date_str)
    return get_observation(code, date_str)

def geocode_commune(name):
    query_clean = name.strip().lower()
    
    # Try cache first
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT label, lat, lon, postcode FROM geocoding_cache WHERE query = ?", (query_clean,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {"label": row[0], "lat": row[1], "lon": row[2], "postcode": row[3]}
        
    # Query API
    q = urllib.parse.quote(name)
    url = f"https://api-adresse.data.gouv.fr/search/?q={q}&limit=1"
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            res = json.loads(r.read().decode('utf-8'))
        if res.get("features"):
            feat = res["features"][0]
            props = feat.get("properties", {})
            geom = feat.get("geometry", {})
            coords = geom.get("coordinates", [None, None])
            
            result = {
                "label": props.get("label", name),
                "lon": coords[0],
                "lat": coords[1],
                "postcode": props.get("postcode")
            }
            
            # Save to cache
            conn = get_conn()
            cursor = conn.cursor()
            cursor.execute("""
            INSERT OR REPLACE INTO geocoding_cache (query, label, lat, lon, postcode)
            VALUES (?, ?, ?, ?, ?)
            """, (query_clean, result["label"], result["lat"], result["lon"], result["postcode"]))
            conn.commit()
            conn.close()
            
            return result
    except Exception as e:
        print(f"Erreur de géocodage pour '{name}' : {e}")
    return None

def get_nearest_station_for_parameter(lat, lon, parameter):
    conn = get_conn()
    cursor = conn.cursor()
    
    if parameter == "temp":
        cursor.execute("SELECT code, name, dept, lat, lon, alt FROM stations WHERE dans_tx = 'Oui'")
    elif parameter == "rain":
        cursor.execute("SELECT code, name, dept, lat, lon, alt FROM stations WHERE dans_rrtn = 'Oui'")
    elif parameter == "wind":
        cursor.execute("SELECT code, name, dept, lat, lon, alt FROM stations WHERE dans_fxi = 'Oui'")
    elif parameter == "sun":
        cursor.execute("""
            SELECT DISTINCT s.code, s.name, s.dept, s.lat, s.lon, s.alt 
            FROM stations s
            JOIN normales_records nr ON s.code = nr.station_code
            WHERE nr.sun_norm IS NOT NULL
        """)
    else:
        cursor.execute("SELECT code, name, dept, lat, lon, alt FROM stations")
        
    rows = cursor.fetchall()
    conn.close()
    
    best = None
    for r in rows:
        s_code, s_name, s_dept, s_lat, s_lon, s_alt = r
        if s_lat is None or s_lon is None: continue
        
        d = haversine(lat, lon, s_lat, s_lon)
        if best is None or d < best["distance_km"]:
            best = {
                "code": s_code,
                "name": s_name,
                "dept": s_dept,
                "lat": s_lat,
                "lon": s_lon,
                "alt": s_alt,
                "distance_km": round(d, 1)
            }
    return best

def get_commune_state(address, date_str):
    # date_str in format YYYYMMDD
    loc = geocode_commune(address)
    if not loc or loc["lat"] is None:
        print(f"Impossible de géolocaliser l'adresse/commune : {address}")
        return None
        
    lat, lon = loc["lat"], loc["lon"]
    print(f"Adresse/commune résolue : {loc['label']} (Lat: {lat}, Lon: {lon})")
    
    params = ["temp", "rain", "wind", "sun"]
    resolved_stations = {}
    for p in params:
        if p == "wind":
            # Rule: Always take the maximum gust within a 30 km radius
            conn = get_conn()
            cursor = conn.cursor()
            cursor.execute("SELECT code, name, dept, lat, lon, alt FROM stations WHERE dans_fxi = 'Oui'")
            all_wind_stations = cursor.fetchall()
            conn.close()
            
            candidate_stations = []
            for r in all_wind_stations:
                s_code, s_name, s_dept, s_lat, s_lon, s_alt = r
                if s_lat is None or s_lon is None:
                    continue
                d = haversine(lat, lon, s_lat, s_lon)
                candidate_stations.append({
                    "code": s_code,
                    "name": s_name,
                    "dept": s_dept,
                    "lat": s_lat,
                    "lon": s_lon,
                    "alt": s_alt,
                    "distance_km": round(d, 1)
                })
            
            stations_within_30km = [s for s in candidate_stations if s["distance_km"] <= 30.0]
            
            best_st = None
            if stations_within_30km:
                max_gust = -1.0
                for st in stations_within_30km:
                    obs = fetch_and_cache(st["code"], date_str)
                    if obs and obs.get("gust") is not None:
                        try:
                            gust_val = float(obs["gust"])
                            if gust_val > max_gust:
                                max_gust = gust_val
                                best_st = st
                        except (ValueError, TypeError):
                            pass
                
                if not best_st:
                    stations_within_30km.sort(key=lambda x: x["distance_km"])
                    best_st = stations_within_30km[0]
            
            if not best_st:
                best_st = get_nearest_station_for_parameter(lat, lon, "wind")
                
            resolved_stations["wind"] = best_st
        else:
            st = get_nearest_station_for_parameter(lat, lon, p)
            resolved_stations[p] = st
        
    state = {
        "resolved_address": loc["label"],
        "postcode": loc["postcode"],
        "date": date_str,
        "coordinates": {"lat": lat, "lon": lon},
        "parameters": {}
    }
    
    for p, st in resolved_stations.items():
        if not st:
            state["parameters"][p] = {"value": None, "station_name": None, "station_code": None, "distance_km": None}
            continue
            
        obs = fetch_and_cache(st["code"], date_str)
        val = None
        records = None
        if obs:
            if p == "temp":
                val = {"tmax": obs.get("tmax"), "tmin": obs.get("tmin")}
                records = {
                    "tmax_rec_m": obs.get("tmax_rec_m"), "tmax_rec_m_date": obs.get("tmax_rec_m_date"),
                    "tmax_rec_a": obs.get("tmax_rec_a"), "tmax_rec_a_date": obs.get("tmax_rec_a_date"),
                    "tmin_rec_m": obs.get("tmin_rec_m"), "tmin_rec_m_date": obs.get("tmin_rec_m_date"),
                    "tmin_rec_a": obs.get("tmin_rec_a"), "tmin_rec_a_date": obs.get("tmin_rec_a_date")
                }
            elif p == "rain":
                val = obs.get("precip")
                records = {
                    "rec_m": obs.get("precip_rec_m"), "rec_m_date": obs.get("precip_rec_m_date"),
                    "rec_a": obs.get("precip_rec_a"), "rec_a_date": obs.get("precip_rec_a_date")
                }
            elif p == "wind":
                val = obs.get("gust")
                records = {
                    "rec_m": obs.get("gust_rec_m"), "rec_m_date": obs.get("gust_rec_m_date"),
                    "rec_a": obs.get("gust_rec_a"), "rec_a_date": obs.get("gust_rec_a_date")
                }
            elif p == "sun":
                val = obs.get("sun")
                records = None
                
        state["parameters"][p] = {
            "value": val,
            "records": records,
            "station_code": st["code"],
            "station_name": st["name"],
            "dept": st["dept"],
            "distance_km": st["distance_km"]
        }
        
    return state

def format_client_address_html(addr_str):
    if not addr_str:
        return ""
    # Find a 5-digit postcode
    m = re.search(r'\b(\d{5})\b', addr_str)
    if m:
        postcode_index = m.start()
        street = addr_str[:postcode_index].strip().rstrip(',').strip()
        rest = addr_str[postcode_index:].strip()
        return f"{street}<br/>{rest}"
    return addr_str
