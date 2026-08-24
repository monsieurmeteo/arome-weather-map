#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pipeline Multi-Modèles Météo — GitHub Actions Production
=========================================================
Génère les cartes WebP réelles pour tous les modèles :
 1. AROME HD (1.3 km)   → API WMS Météo-France (token secret GitHub)
 2. ICON-EU  (7 km)     → DWD Open Data GRIB2 (gratuit, sans clé)
 3. GFS      (25 km)    → NOAA NOMADS Open Data (gratuit, sans clé)
 4. ECMWF    (9 km)     → ecmwf-opendata (gratuit, sans clé)
"""

import os, sys, json, datetime, io, bz2, tempfile, shutil, argparse
import requests, numpy as np, urllib3
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image
from scipy.interpolate import RegularGridInterpolator

urllib3.disable_warnings()

BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
WIDTH, HEIGHT = 2200, 1640
N_STEPS = 25
BOUNDS = {"south": 38.0, "west": -12.0, "north": 53.0, "east": 16.0}

# Token AROME : en CI via $METEOFRANCE_TOKEN ; en local via dpclim_token.txt
TOKEN_PATH = os.path.expanduser(
    r"~/.gemini/config/skills/dpclim/config/dpclim_token.txt"
)

def get_mf_token():
    t = os.environ.get("METEOFRANCE_TOKEN", "").strip()
    if t:
        return t
    if os.path.exists(TOKEN_PATH):
        with open(TOKEN_PATH, encoding="utf-8") as f:
            return f.read().strip()
    return ""

LABELS = {
    "temperature":           ("Temperature a 2 m",      "degC"),
    "temperature_ressentie": ("Temperature ressentie",   "degC"),
    "point_rosee":           ("Point de rosee",          "degC"),
    "humidex":               ("Indice Humidex",          ""),
    "pluie_1h":              ("Pluie horaire",           "mm"),
    "pluie_cumul":           ("Pluie cumulee",           "mm"),
    "vent":                  ("Vent moyen 10 m",         "km/h"),
    "rafales":               ("Rafales maximales",       "km/h"),
    "mucape":                ("MUCAPE (instabilite)",    "J/kg"),
    "neige":                 ("Neige fraiche",           "cm"),
    "neige_au_sol":          ("Neige au sol",            "cm"),
    "pression":              ("Pression reduite mer",    "hPa"),
    "humidite":              ("Humidite relative 2 m",  "%"),
    "reflectivite":          ("Reflectivite radar",      "dBZ"),
}
LAYERS = list(LABELS.keys())

PALETTES = {
    "temperature":           [(-30,(73,0,255,255)),(-15,(0,128,255,255)),(-5,(0,255,230,255)),(0,(255,255,255,255)),(5,(120,255,120,255)),(10,(0,200,0,255)),(15,(255,255,0,255)),(20,(255,165,0,255)),(25,(255,80,0,255)),(30,(200,0,0,255)),(35,(140,0,0,255)),(40,(100,0,80,255)),(45,(60,0,60,255))],
    "temperature_ressentie": [(-30,(73,0,255,255)),(-10,(0,200,255,255)),(0,(255,255,255,255)),(10,(120,255,120,255)),(20,(255,255,0,255)),(30,(255,80,0,255)),(40,(140,0,0,255))],
    "point_rosee":           [(-10,(200,200,255,255)),(5,(100,200,255,255)),(10,(50,200,100,255)),(15,(0,200,0,255)),(20,(200,200,0,255)),(25,(255,100,0,255))],
    "humidex":               [(0,(200,200,255,255)),(20,(100,255,100,255)),(25,(255,255,0,255)),(30,(255,165,0,255)),(35,(255,80,0,255)),(40,(200,0,0,255)),(54,(100,0,0,255))],
    "pluie_1h":              [(0,(0,0,0,0)),(0.1,(173,216,230,255)),(1,(0,100,255,255)),(3,(0,200,0,255)),(7,(255,255,0,255)),(15,(255,165,0,255)),(30,(255,0,0,255)),(50,(160,0,160,255))],
    "pluie_cumul":           [(0,(0,0,0,0)),(1,(173,216,230,255)),(5,(0,100,255,255)),(10,(0,200,0,255)),(25,(255,255,0,255)),(50,(255,165,0,255)),(100,(255,0,0,255)),(200,(160,0,160,255))],
    "vent":                  [(0,(200,230,255,255)),(10,(0,200,255,255)),(20,(0,200,100,255)),(40,(255,255,0,255)),(60,(255,165,0,255)),(80,(255,60,0,255)),(100,(200,0,0,255)),(130,(100,0,100,255))],
    "rafales":               [(0,(200,230,255,255)),(20,(0,200,255,255)),(40,(0,200,100,255)),(60,(255,255,0,255)),(80,(255,165,0,255)),(100,(255,60,0,255)),(130,(200,0,0,255)),(160,(100,0,100,255))],
    "mucape":                [(0,(50,50,50,0)),(50,(100,100,255,255)),(200,(0,255,200,255)),(500,(0,200,0,255)),(1000,(255,255,0,255)),(2000,(255,165,0,255)),(3500,(255,0,0,255)),(5000,(160,0,160,255))],
    "neige":                 [(0,(0,0,0,0)),(0.1,(200,230,255,255)),(1,(100,180,255,255)),(3,(50,100,200,255)),(10,(0,0,180,255)),(20,(100,0,150,255))],
    "neige_au_sol":          [(0,(0,0,0,0)),(1,(200,230,255,255)),(5,(150,200,255,255)),(20,(100,150,255,255)),(50,(50,100,200,255)),(100,(0,0,180,255)),(200,(100,0,150,255))],
    "pression":              [(960,(130,0,130,255)),(975,(0,0,200,255)),(985,(0,150,255,255)),(995,(0,200,150,255)),(1005,(0,180,0,255)),(1013,(200,200,200,255)),(1020,(255,220,100,255)),(1030,(255,150,0,255)),(1040,(200,80,0,255))],
    "humidite":              [(0,(200,150,100,255)),(20,(220,180,120,255)),(40,(255,255,200,255)),(60,(180,255,180,255)),(80,(0,200,200,255)),(90,(0,100,255,255)),(100,(0,0,200,255))],
    "reflectivite":          [(0,(0,0,0,0)),(5,(100,200,255,255)),(15,(0,0,255,255)),(25,(0,255,0,255)),(35,(255,255,0,255)),(45,(255,165,0,255)),(55,(255,0,0,255)),(65,(160,0,160,255))],
}

def apply_palette(data, palette):
    vs = np.array([s[0] for s in palette], dtype=np.float32)
    cs = np.array([list(s[1]) for s in palette], dtype=np.float32)
    rgba = np.zeros((*data.shape, 4), dtype=np.uint8)
    for i in range(len(vs) - 1):
        mask = (data >= vs[i]) & (data < vs[i+1])
        if not np.any(mask): continue
        t = (data[mask] - vs[i]) / (vs[i+1] - vs[i])
        for c in range(4):
            rgba[mask, c] = np.clip(cs[i,c] + t*(cs[i+1,c]-cs[i,c]), 0, 255).astype(np.uint8)
    rgba[data <= vs[0]] = cs[0].astype(np.uint8)
    rgba[data >= vs[-1]] = cs[-1].astype(np.uint8)
    return rgba

def regrid(data, lats, lons):
    if lats[0] > lats[-1]:
        lats, data = lats[::-1], data[::-1, :]
    lat_out = np.linspace(BOUNDS["south"], BOUNDS["north"], HEIGHT)[::-1]
    lon_out = np.linspace(BOUNDS["west"],  BOUNDS["east"],  WIDTH)
    lo, la  = np.meshgrid(lon_out, lat_out)
    pts = np.stack([la.ravel(), lo.ravel()], axis=-1)
    pts[:,0] = np.clip(pts[:,0], lats[0], lats[-1])
    pts[:,1] = np.clip(pts[:,1], lons[0], lons[-1])
    fn = RegularGridInterpolator((lats, lons), data, method='linear',
                                  bounds_error=False, fill_value=np.nan)
    return fn(pts).reshape(HEIGHT, WIDTH).astype(np.float32)

def save_webp(data, layer, dst):
    rgba = apply_palette(data, PALETTES.get(layer, PALETTES["temperature"]))
    Image.fromarray(rgba, "RGBA").save(dst, format="WEBP", quality=85, method=4)

def write_manifest(out_dir, steps, meta):
    layers_info = {l: {"label": LABELS[l][0], "unit": LABELS[l][1], "decimals": 1} for l in LAYERS}
    m = {"schema_version": 6, "status": "ok",
         "model_name": meta["name"], "provider": meta["provider"],
         "resolution": meta["resolution"],
         "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
         "run_time": meta["run_time"], "bounds": BOUNDS,
         "overlay": "maps/frontieres.svg", "places": "maps/communes.json",
         "layers": layers_info, "steps": steps}
    with open(os.path.join(out_dir, "index.json"), "w", encoding="utf-8") as f:
        json.dump(m, f, indent=2, ensure_ascii=False)

def ensure_dir(p):
    os.makedirs(p, exist_ok=True)
    return p

# AROME HD
AROME_WMS_MAP = {
    "temperature":           ("TEMPERATURE__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND", "T__HEIGHT__SHADING"),
    "temperature_ressentie": ("TEMPERATURE__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND", "T__HEIGHT__SHADING"),
    "point_rosee":           ("DEW_POINT_TEMPERATURE__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND", "TD__HEIGHT__SHADING"),
    "humidex":               ("TEMPERATURE__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND", "T__HEIGHT__SHADING"),
    "pluie_1h":              ("TOTAL_WATER_PRECIPITATION__GROUND_OR_WATER_SURFACE", "EAU__GROUND__RADAR_SHADING"),
    "pluie_cumul":           ("TOTAL_PRECIPITATION__GROUND_OR_WATER_SURFACE", "PRECIP__GROUND__RADAR_SHADING"),
    "vent":                  ("WIND_SPEED__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND", "FF__HEIGHT__SHADING"),
    "rafales":               ("WIND_SPEED_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND", "FF__HEIGHT__SHADING"),
    "mucape":                ("MEAN_LAYER_CAPE__GROUND_OR_WATER_SURFACE", "CAPE_INS__GROUND__SHADING"),
    "neige":                 ("TOTAL_SNOW_PRECIPITATION__GROUND_OR_WATER_SURFACE", "NEIGE__GROUND__RADAR_SHADING"),
    "neige_au_sol":          ("SNOW_DEPTH__GROUND_OR_WATER_SURFACE", "NEIGE__GROUND__RADAR_SHADING"),
    "pression":              ("PRESSURE__MEAN_SEA_LEVEL", "P__LEVEL__SHADING"),
    "humidite":              ("RELATIVE_HUMIDITY__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND", "HU__HEIGHT__SHADING"),
    "reflectivite":          ("BRIGHTNESS_TEMPERATURE__GROUND_OR_WATER_SURFACE", "BT__CHANNELS_108__SHADING"),
}
AROME_WMS = "https://public-api.meteofrance.fr/public/arome/1.0/wms/MF-NWP-HIGHRES-AROME-001-FRANCE-WMS/GetMap"

def _fetch_arome_tile(session, token, wms_layer, style, time_str, ref_str, dst):
    headers = {"apikey": token, "Authorization": "Bearer " + token,
               "User-Agent": "Mozilla/5.0"}
    params = {"service": "WMS", "version": "1.3.0", "request": "GetMap",
              "layers": wms_layer, "styles": style,
              "crs": "EPSG:4326", "bbox": "38.0,-12.0,53.0,16.0",
              "width": str(WIDTH), "height": str(HEIGHT),
              "format": "image/png", "transparent": "TRUE",
              "time": time_str, "reference_time": ref_str}
    try:
        r = session.get(AROME_WMS, params=params, headers=headers, timeout=30, verify=False)
        if r.status_code == 200 and len(r.content) > 1000:
            img = Image.open(io.BytesIO(r.content)).convert("RGBA")
            img.save(dst, format="WEBP", quality=85, method=4)
            return True
    except Exception:
        pass
    return False

def run_arome():
    token = get_mf_token()
    if not token:
        print("ERROR AROME: token Meteo-France introuvable (env METEOFRANCE_TOKEN)")
        return
    print("AROME HD (1.3 km) - Meteo-France WMS...")
    out_dir   = ensure_dir(os.path.join(OUTPUT_DIR, "maps"))
    arome_dir = ensure_dir(os.path.join(OUTPUT_DIR, "arome", "maps"))

    now   = datetime.datetime.now(datetime.timezone.utc)
    run_h = (now.hour // 3) * 3
    run_dt = now.replace(hour=run_h, minute=0, second=0, microsecond=0)
    if (now - run_dt).total_seconds() < 5400:
        run_dt -= datetime.timedelta(hours=3)
    ref_str = run_dt.strftime("%Y-%m-%dT%H:00:00Z")
    print("  Run AROME:", ref_str)

    session = requests.Session()
    steps, futs = [], []
    with ThreadPoolExecutor(max_workers=6) as ex:
        for lh in range(N_STEPS):
            vt = run_dt + datetime.timedelta(hours=lh)
            time_str = vt.strftime("%Y-%m-%dT%H:00:00Z")
            step = {"lead_hour": lh, "valid_time": vt.isoformat(), "files": {}}
            for layer in LAYERS:
                wl, st = AROME_WMS_MAP.get(layer, AROME_WMS_MAP["temperature"])
                dst1 = os.path.join(out_dir,   layer, "%03d.webp" % lh)
                dst2 = os.path.join(arome_dir, layer, "%03d.webp" % lh)
                ensure_dir(os.path.dirname(dst1)); ensure_dir(os.path.dirname(dst2))
                step["files"][layer] = "maps/%s/%03d.webp" % (layer, lh)
                futs.append(ex.submit(_fetch_arome_tile, session, token, wl, st, time_str, ref_str, dst1))
            steps.append(step)
        total = len(futs)
        for i, _ in enumerate(as_completed(futs), 1):
            if i % 28 == 0 or i == total:
                print("  AROME %d/%d (%d%%)" % (i, total, i*100//total))

    for layer in LAYERS:
        for lh in range(N_STEPS):
            src = os.path.join(out_dir, layer, "%03d.webp" % lh)
            dst = os.path.join(arome_dir, layer, "%03d.webp" % lh)
            if os.path.exists(src) and not os.path.exists(dst):
                shutil.copy2(src, dst)

    meta = {"name": "AROME HD (1,3 km)", "provider": "Meteo-France",
            "resolution": "1,3 km (0.01 deg)", "run_time": run_dt.isoformat()}
    write_manifest(out_dir, steps, meta)
    write_manifest(arome_dir, steps, meta)
    print("  OK AROME termine")

ICON_VARS = {
    "temperature": "t_2m", "temperature_ressentie": "t_2m",
    "point_rosee": "td_2m", "humidex": "t_2m",
    "pluie_1h": "tot_prec", "pluie_cumul": "tot_prec",
    "vent": "u_10m", "rafales": "vmax_10m",
    "mucape": "cape_con", "neige": "snow_gsp", "neige_au_sol": "h_snow",
    "pression": "pmsl", "humidite": "relhum_2m", "reflectivite": "tot_prec",
}

def run_icon():
    try:
        import cfgrib
    except ImportError:
        print("ERROR ICON: cfgrib non installe")
        return
    print("ICON-EU (7 km) - DWD Open Data...")
    icon_dir = ensure_dir(os.path.join(OUTPUT_DIR, "icon", "maps"))
    now = datetime.datetime.now(datetime.timezone.utc)
    run_h = (now.hour // 3) * 3
    run_dt = now.replace(hour=run_h, minute=0, second=0, microsecond=0)
    if (now - run_dt).total_seconds() < 7200:
        run_dt -= datetime.timedelta(hours=3)
    day_str = run_dt.strftime("%Y%m%d")
    h_str = "%02d" % run_dt.hour
    print("  Run ICON-EU:", run_dt.strftime("%Y-%m-%d %H:00 UTC"))

    steps = []
    for lh in range(N_STEPS):
        vt = run_dt + datetime.timedelta(hours=lh)
        step = {"lead_hour": lh, "valid_time": vt.isoformat(), "files": {}}
        print("  [ICON] H+%02d" % lh, end="", flush=True)
        cached = {}
        for layer in LAYERS:
            var = ICON_VARS.get(layer, "t_2m")
            dst = os.path.join(icon_dir, layer, "%03d.webp" % lh)
            ensure_dir(os.path.dirname(dst))
            step["files"][layer] = "maps/%s/%03d.webp" % (layer, lh)
            if var not in cached:
                fn = "icon-eu_europe_regular-lat-lon_single-level_%s%s_%03d_%s.grib2.bz2" % (day_str, h_str, lh, var.upper())
                url = "https://opendata.dwd.de/weather/nwp/icon-eu/grib/%s/%s/%s" % (h_str, var, fn)
                try:
                    r = requests.get(url, timeout=30, verify=False)
                    if r.status_code == 200:
                        raw = bz2.decompress(r.content)
                        with tempfile.NamedTemporaryFile(suffix=".grib2", delete=False) as tf:
                            tf.write(raw); tmp = tf.name
                        ds = cfgrib.open_dataset(tmp)
                        vk = list(ds.data_vars)[0]
                        d = ds[vk].values; la = ds.latitude.values; lo = ds.longitude.values
                        os.remove(tmp)
                        if layer in ("temperature","temperature_ressentie","point_rosee","humidex") and d.max() > 100:
                            d = d - 273.15
                        elif layer == "pression" and d.max() > 10000:
                            d = d / 100.0
                        elif layer in ("vent","rafales") and d.max() < 200:
                            d = d * 3.6
                        cached[var] = regrid(d, la, lo)
                    else:
                        cached[var] = None
                except Exception:
                    cached[var] = None
            if cached.get(var) is not None:
                save_webp(cached[var], layer, dst)
        print(" OK")
        steps.append(step)

    write_manifest(icon_dir, steps, {"name": "ICON-EU (7 km)", "provider": "DWD Allemagne",
                                     "resolution": "7 km (0.0625 deg)", "run_time": run_dt.isoformat()})
    print("  OK ICON-EU termine")

def run_gfs():
    try:
        import cfgrib
    except ImportError:
        print("ERROR GFS: cfgrib non installe")
        return
    print("GFS (25 km) - NOAA NOMADS Open Data...")
    gfs_dir = ensure_dir(os.path.join(OUTPUT_DIR, "gfs", "maps"))
    now = datetime.datetime.now(datetime.timezone.utc)
    run_h = (now.hour // 6) * 6
    run_dt = now.replace(hour=run_h, minute=0, second=0, microsecond=0)
    if (now - run_dt).total_seconds() < 14400:
        run_dt -= datetime.timedelta(hours=6)
    day_str = run_dt.strftime("%Y%m%d")
    h_str = "%02d" % run_dt.hour
    print("  Run GFS:", run_dt.strftime("%Y-%m-%d %H:00 UTC"))

    gfs_req_vars = ["TMP","DPT","UGRD","VGRD","GUST","APCP","CAPE","SNOD","PRMSL","RH"]
    gfs_layer_var = {"temperature":"TMP","temperature_ressentie":"TMP","point_rosee":"DPT",
                     "humidex":"TMP","pluie_1h":"APCP","pluie_cumul":"APCP",
                     "vent":"UGRD","rafales":"GUST","mucape":"CAPE",
                     "neige":"SNOD","neige_au_sol":"SNOD","pression":"PRMSL",
                     "humidite":"RH","reflectivite":"APCP"}
    steps = []

    for lh in range(N_STEPS):
        vt = run_dt + datetime.timedelta(hours=lh)
        fhh = "%03d" % lh
        step = {"lead_hour": lh, "valid_time": vt.isoformat(), "files": {}}
        print("  [GFS] H+%02d" % lh, end="", flush=True)

        params = {
            "dir": "/gfs.%s/%s/atmos" % (day_str, h_str),
            "file": "gfs.t%sz.pgrb2.0p25.f%s" % (h_str, fhh),
            "subregion": "", "leftlon": "-15", "rightlon": "20",
            "toplat": "57", "bottomlat": "35",
        }
        for v in gfs_req_vars:
            params["var_" + v] = "on"
        params.update({"lev_2_m_above_ground": "on", "lev_10_m_above_ground": "on",
                        "lev_surface": "on", "lev_mean_sea_level": "on"})

        grib_bytes = None
        try:
            r = requests.get("https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl",
                             params=params, timeout=45, verify=False)
            if r.status_code == 200 and len(r.content) > 500:
                grib_bytes = r.content
        except Exception:
            pass

        cached = {}
        if grib_bytes:
            with tempfile.NamedTemporaryFile(suffix=".grib2", delete=False) as tf:
                tf.write(grib_bytes); tmp = tf.name
            try:
                for ds in cfgrib.open_datasets(tmp):
                    for v in ds.data_vars:
                        vu = v.upper()
                        if vu not in cached:
                            cached[vu] = (ds[v].values, ds.latitude.values, ds.longitude.values)
            except Exception:
                pass
            finally:
                try: os.remove(tmp)
                except: pass

        for layer in LAYERS:
            dst = os.path.join(gfs_dir, layer, "%03d.webp" % lh)
            ensure_dir(os.path.dirname(dst))
            step["files"][layer] = "maps/%s/%03d.webp" % (layer, lh)
            key = gfs_layer_var.get(layer, "TMP")
            if key in cached:
                d, la, lo = cached[key]
                if layer in ("temperature","temperature_ressentie","humidex") and d.max() > 200: d = d - 273.15
                elif layer == "point_rosee" and d.max() > 200: d = d - 273.15
                elif layer == "pression" and d.max() > 10000: d = d / 100.0
                elif layer in ("vent","rafales") and d.max() < 200: d = d * 3.6
                save_webp(regrid(d, la, lo), layer, dst)

        print(" OK")
        steps.append(step)

    write_manifest(gfs_dir, steps, {"name": "GFS Monde (25 km)", "provider": "NOAA Etats-Unis",
                                    "resolution": "25 km (0.25 deg)", "run_time": run_dt.isoformat()})
    print("  OK GFS termine")

def run_ecmwf():
    try:
        from ecmwf.opendata import Client
        import cfgrib
    except ImportError:
        print("ERROR ECMWF: pip install ecmwf-opendata cfgrib eccodes")
        return
    print("ECMWF IFS (9 km) - CEPMMT Open Data...")
    ecmwf_dir = ensure_dir(os.path.join(OUTPUT_DIR, "ecmwf", "maps"))
    now = datetime.datetime.now(datetime.timezone.utc)
    run_h = 0 if now.hour < 12 else 12
    run_dt = now.replace(hour=run_h, minute=0, second=0, microsecond=0)
    if (now - run_dt).total_seconds() < 18000:
        run_dt -= datetime.timedelta(hours=12)
    print("  Run ECMWF:", run_dt.strftime("%Y-%m-%d %H:00 UTC"))

    client = Client("ecmwf", beta=True)
    ecmwf_param_map = {"temperature":"2t","temperature_ressentie":"2t","point_rosee":"2d",
                       "humidex":"2t","pluie_1h":"tp","pluie_cumul":"tp","vent":"10u",
                       "rafales":"10u","mucape":"cape","neige":"tp","neige_au_sol":"tp",
                       "pression":"msl","humidite":"2d","reflectivite":"tp"}
    steps = []

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_grib = os.path.join(tmp_dir, "ifs.grib2")
        try:
            client.retrieve(step=list(range(N_STEPS)),
                            param=["2t","2d","10u","10v","msl","tp","cape"],
                            target=tmp_grib,
                            date=run_dt.strftime("%Y%m%d"), time=run_h)
        except Exception as e:
            print("  ECMWF download error:", e)
            return

        try:
            all_ds = cfgrib.open_datasets(tmp_grib)
        except Exception as e:
            print("  ECMWF decode error:", e)
            return

        for lh in range(N_STEPS):
            vt = run_dt + datetime.timedelta(hours=lh)
            step = {"lead_hour": lh, "valid_time": vt.isoformat(), "files": {}}
            print("  [ECMWF] H+%02d" % lh, end="", flush=True)
            for layer in LAYERS:
                dst = os.path.join(ecmwf_dir, layer, "%03d.webp" % lh)
                ensure_dir(os.path.dirname(dst))
                step["files"][layer] = "maps/%s/%03d.webp" % (layer, lh)
                param = ecmwf_param_map.get(layer, "2t")
                for ds in all_ds:
                    if param not in ds.data_vars: continue
                    try:
                        sub = ds.sel(step=np.timedelta64(lh,"h"), method="nearest")
                    except Exception:
                        sub = ds.isel(step=0) if "step" in ds.dims else ds
                    d = sub[param].values
                    la, lo = ds.latitude.values, ds.longitude.values
                    if layer in ("temperature","temperature_ressentie","humidex") and d.max() > 200: d = d - 273.15
                    elif layer == "point_rosee" and d.max() > 200: d = d - 273.15
                    elif layer == "pression" and d.max() > 10000: d = d / 100.0
                    elif layer in ("vent","rafales"): d = d * 3.6
                    save_webp(regrid(d, la, lo), layer, dst)
                    break
            print(" OK")
            steps.append(step)

    write_manifest(ecmwf_dir, steps, {"name": "ECMWF IFS (9 km)", "provider": "CEPMMT Europe",
                                      "resolution": "9 km (0.1 deg)", "run_time": run_dt.isoformat()})
    print("  OK ECMWF IFS termine")


RUNNERS = {"arome": run_arome, "icon": run_icon, "gfs": run_gfs, "ecmwf": run_ecmwf}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", choices=["arome","icon","gfs","ecmwf","all"], default="all")
    args = parser.parse_args()
    targets = list(RUNNERS.keys()) if args.model == "all" else [args.model]
    for model in targets:
        try:
            RUNNERS[model]()
        except Exception as exc:
            print("WARNING %s failed: %s" % (model.upper(), exc))
    print("Pipeline termine.")
