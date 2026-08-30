#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
package_archive.py — Générateur d'archives MÉTÉO ÉLITE « PHOTOS COMPLÈTES » JPEG (.jpg)
========================================================================================
- Paramètres d'élite 100% utiles : Orages, Grêle, T2m, Pluie, Neige, Vent, Rafales, Synthèses 24h.
- Sont exclus : ressentie, rosée, humidex, nébulosités/ciel, pressions.
- Photos complètes JPEG (.jpg) 100% prêtes à l'emploi (Fond + Météo + Frontières).
"""

import os
import shutil
import zipfile
import math
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

# 1. Catégories D'ÉLITE uniquement
CATEGORIES = {
    "01_ORAGES_ET_GRELE": {
        "ipo": "01_Potentiel_Orageux_IPO",
        "ipg": "02_Potentiel_Grele_IPG",
        "orages_simules": "03_Orages_Simules_Radar_dBZ",
        "instabilite": "04_Instabilite_MUCAPE_Jkg",
        "rafales_convectives": "05_Rafales_Convectives_kmh",
        "ipt": "06_Potentiel_Tornadique_IPT"
    },
    "02_TEMPERATURE": {
        "temperature": "01_Temperature_2m_C"
    },
    "03_PRECIPITATIONS_ET_NEIGE": {
        "pluie_1h": "01_Pluie_Horaire_1h_mm",
        "pluie_cumul": "02_Pluie_Cumulee_Totale_mm",
        "neige": "03_Chutes_de_Neige_1h_mm",
        "neige_au_sol": "04_Epaisseur_Neige_au_Sol_cm",
        "graupel": "05_Gresil_Graupel_mm"
    },
    "04_VENTS_ET_RAFALES": {
        "vent": "01_Vent_Moyen_10m_kmh",
        "rafales": "02_Rafales_Instantanees_10m_kmh",
        "rafales_cumul": "03_Rafales_Max_Cumulees_kmh"
    }
}

# 6 paramètres d'élite pour chaque région
REGION_KEY_LAYERS = ["temperature", "pluie_1h", "pluie_cumul", "vent", "rafales", "ipg"]

# Échéances tri-horaires standard (H+00, H+03, H+06, H+09, H+12... H+51)
TRI_HOURLY_STEPS = {f"{h:03d}" for h in range(0, 52, 3)}

MAP_BOUNDS = {'north': 53.0, 'south': 39.5, 'west': -6.0, 'east': 11.5}
MAP_W, MAP_H = 2200, 1640

def get_mercator_xy(lat, lon):
    north_y = math.log(math.tan(math.pi/4 + math.radians(MAP_BOUNDS['north'])/2))
    south_y = math.log(math.tan(math.pi/4 + math.radians(MAP_BOUNDS['south'])/2))
    u = (lon - MAP_BOUNDS['west']) / (MAP_BOUNDS['east'] - MAP_BOUNDS['west'])
    v = (north_y - math.log(math.tan(math.pi/4 + math.radians(lat)/2))) / (north_y - south_y)
    return u * MAP_W, v * MAP_H

REGIONS_CONFIG = {
    '01_HAUTS_DE_FRANCE': {'lat': 49.85, 'lon': 2.82, 'scale': 2.65},
    '02_NORMANDIE': {'lat': 48.95, 'lon': -0.07, 'scale': 2.85},
    '03_ILE_DE_FRANCE': {'lat': 48.65, 'lon': 2.50, 'scale': 4.20},
    '04_GRAND_EST': {'lat': 48.65, 'lon': 5.80, 'scale': 2.25},
    '05_BRETAGNE': {'lat': 48.00, 'lon': -3.08, 'scale': 2.80},
    '06_PAYS_DE_LA_LOIRE': {'lat': 47.30, 'lon': -0.85, 'scale': 2.75},
    '07_CENTRE_VAL_DE_LOIRE': {'lat': 47.45, 'lon': 1.60, 'scale': 2.55},
    '08_BOURGOGNE_FRANCHE_COMTE': {'lat': 47.10, 'lon': 5.00, 'scale': 2.65},
    '09_NOUVELLE_AQUITAINE': {'lat': 44.95, 'lon': 0.40, 'scale': 1.85},
    '10_AUVERGNE_RHONE_ALPES': {'lat': 45.30, 'lon': 4.65, 'scale': 2.25},
    '11_OCCITANIE': {'lat': 43.50, 'lon': 2.25, 'scale': 2.25},
    '12_PACA': {'lat': 43.85, 'lon': 6.00, 'scale': 2.85},
    '13_CORSE': {'lat': 42.10, 'lon': 9.05, 'scale': 4.20}
}

REGION_CROPS = {}
for r_name, cfg in REGIONS_CONFIG.items():
    cx, cy = get_mercator_xy(cfg['lat'], cfg['lon'])
    crop_w = MAP_W / cfg['scale']
    crop_h = MAP_H / cfg['scale']
    x0 = max(0, int(cx - crop_w/2))
    y0 = max(0, int(cy - crop_h/2))
    x1 = min(MAP_W, int(cx + crop_w/2))
    y1 = min(MAP_H, int(cy + crop_h/2))
    REGION_CROPS[r_name] = (x0, y0, x1, y1)

README_JPEG_INDEX = """===============================================================================
ARCHIVES METEO ÉLITE « PHOTOS COMPLÈTES JPEG (.JPG) » — MODELE AROME HD
===============================================================================
Date de l'archive : {date_str}
Rendu visuel : Photos completes 100% pretes a l'emploi (Fond + Couleur Meteo + Frontieres departementales)
Format : JPEG (.jpg) Universel compatible 100% (Windows, Mac, iPhone, Android, Word, Outlook, PowerPoint)

STRUCTURE DES DOSSIERS :
- 00_FRANCE_ENTIERE/
    * 01_ORAGES_ET_GRELE (Photos completes IPO, IPG, Radar dBZ, CAPE, Rafales, IPT)
    * 02_TEMPERATURE (Photos completes Temperature 2m C)
    * 03_PRECIPITATIONS_ET_NEIGE (Photos completes Pluie 1h, Cumuls totaux, Neige 1h, Neige sol, Gresil)
    * 04_VENTS_ET_RAFALES (Photos completes Vent moyen 10m, Rafales instantanees, Rafales max cumulees)

- 01_HAUTS_DE_FRANCE/ a 13_CORSE/
    * Photos completes et recadrees sur chaque region (Temperature, Pluie 1h, Cumuls, Vent, Rafales, Grele)

- 05_SYNTHESES_QUOTIDIENNES_24H/
    * Photos de synthese 24h maximales (Max Grele, Cumul Pluie, Rafales Max)
===============================================================================
"""

def process_single_photo(task):
    src_f, dst_f, fond_img, front_img, crop_box, target_size = task
    try:
        with Image.open(src_f) as weather_layer:
            weather_rgba = weather_layer.convert("RGBA")
            comp = Image.alpha_composite(fond_img, weather_rgba)
            comp = Image.alpha_composite(comp, front_img).convert("RGB")
            if crop_box:
                comp = comp.crop(crop_box)
            comp_small = comp.resize(target_size, Image.Resampling.LANCZOS)
            with open(dst_f, "wb") as f_out:
                comp_small.save(f_out, "JPEG", quality=75, optimize=True, progressive=True)
            return True
    except Exception:
        return False

def package_daily_archive(maps_dir="output/arome/maps", out_zip_name=None):
    if not os.path.exists(maps_dir):
        print(f"Erreur : Repertoire {maps_dir} introuvable.")
        return None, 0, 0

    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    if not out_zip_name:
        out_zip_name = f"arome_cartes_{date_str}.zip"

    temp_root = f"temp_archive_elite_{date_str}"
    if os.path.exists(temp_root):
        try:
            shutil.rmtree(temp_root, ignore_errors=True)
        except Exception:
            pass
    os.makedirs(temp_root, exist_ok=True)

    print(f"📦 Preparation des photos completes JPEG pour {date_str}...")

    # Load Base Map
    fond_path = os.path.join(maps_dir, "fond.webp")
    if not os.path.exists(fond_path):
        fond_path = os.path.join(maps_dir, "fond.png")
    
    fond_img = Image.open(fond_path).convert("RGBA") if os.path.exists(fond_path) else Image.new("RGBA", (MAP_W, MAP_H), (240, 240, 240, 255))
    
    # Load Borders overlay
    front_path = os.path.join(maps_dir, "frontieres_overlay.png")
    if os.path.exists(front_path):
        front_img = Image.open(front_path).convert("RGBA")
    else:
        front_img = Image.new("RGBA", (MAP_W, MAP_H), (0, 0, 0, 0))

    tasks = []

    # 1. France Entiere
    france_dir = os.path.join(temp_root, "00_FRANCE_ENTIERE")
    for cat_name, layer_map in CATEGORIES.items():
        cat_dir = os.path.join(france_dir, cat_name)
        for layer_key, clean_name in layer_map.items():
            src_layer = os.path.join(maps_dir, layer_key)
            if os.path.exists(src_layer):
                dst_layer = os.path.join(cat_dir, clean_name)
                os.makedirs(dst_layer, exist_ok=True)
                for f in os.listdir(src_layer):
                    base_name, ext = os.path.splitext(f)
                    if ext.lower() in [".webp", ".png"] and (base_name in TRI_HOURLY_STEPS or len(base_name) != 3):
                        src_f = os.path.join(src_layer, f)
                        dst_f = os.path.join(dst_layer, f"{base_name}.jpg")
                        tasks.append((src_f, dst_f, fond_img, front_img, None, (1000, 745)))

    # 2. 13 Regions
    for r_name, crop_box in REGION_CROPS.items():
        r_dir = os.path.join(temp_root, r_name)
        os.makedirs(r_dir, exist_ok=True)
        for layer_key in REGION_KEY_LAYERS:
            src_layer = os.path.join(maps_dir, layer_key)
            if os.path.exists(src_layer):
                for step_code in sorted(TRI_HOURLY_STEPS):
                    src_f = os.path.join(src_layer, f"{step_code}.webp")
                    if not os.path.exists(src_f):
                        src_f = os.path.join(src_layer, f"{step_code}.png")
                    if os.path.exists(src_f):
                        dst_f = os.path.join(r_dir, f"{layer_key}_H{step_code}.jpg")
                        tasks.append((src_f, dst_f, fond_img, front_img, crop_box, (800, 600)))

    # 3. Syntheses 24h
    synth_dir = os.path.join(temp_root, "05_SYNTHESES_QUOTIDIENNES_24H")
    os.makedirs(synth_dir, exist_ok=True)
    for f in os.listdir(maps_dir):
        if "_24h_" in f and f.endswith((".webp", ".png")):
            base_name, _ = os.path.splitext(f)
            src_f = os.path.join(maps_dir, f)
            dst_f = os.path.join(synth_dir, f"{base_name}.jpg")
            tasks.append((src_f, dst_f, fond_img, front_img, None, (1000, 745)))

    print(f"🚀 Execution multi-thread de {len(tasks)} photos completes...")
    with ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(process_single_photo, tasks))
    
    img_count = sum(1 for r in results if r)

    # 4. README
    with open(os.path.join(temp_root, "LISEZ-MOI_INDEX.txt"), "w", encoding="utf-8") as rf:
        rf.write(README_JPEG_INDEX.format(date_str=date_str))

    # 5. Compression ZIP MAXIMALE (Niveau 9)
    print(f"🗜️ Compression ZIP maximale (niveau 9) vers {out_zip_name} ({img_count} photos JPEG)...")
    with zipfile.ZipFile(out_zip_name, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        for root, dirs, files in os.walk(temp_root):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, temp_root)
                zipf.write(file_path, arcname)

    try:
        shutil.rmtree(temp_root, ignore_errors=True)
    except Exception:
        pass

    zip_size_mb = os.path.getsize(out_zip_name) / (1024 * 1024)
    print(f"✅ Archive PHOTOS JPEG ÉLITE {out_zip_name} terminée : {zip_size_mb:.2f} Mo ({img_count} photos) !")
    return out_zip_name, zip_size_mb, img_count

if __name__ == "__main__":
    package_daily_archive()
