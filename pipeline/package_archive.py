#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
package_archive.py — Générateur d'archives MÉTÉO « PHOTOS D'ANTENNE COMPLÈTES » WebP (.webp)
=============================================================================================
- Photos finies prêtes à l'emploi (Fond + Calque météo + Frontières/Départements).
- En-tête officiel Météo-Climat Pro : Logo, Nom du modèle, Titre du paramètre, Échéance H+XX, Date.
- Échelle / Légende colorimétrique en bas avec valeurs et unités.
- Format WebP (.webp) ultra-léger (~25-35 Mo l'archive complète pour France + 13 Régions).
"""

import os
import shutil
import zipfile
import math
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw, ImageFont

# 1. Paramètres indispensables uniquement (Orages, Grêle, T2m, Pluie, Neige, Vent, Rafales)
CATEGORIES = {
    "01_ORAGES_ET_GRELE": {
        "ipo": ("01_Potentiel_Orageux_IPO", "Indice de Potentiel Orageux (IPO)", "/100", (0, 100)),
        "ipg": ("02_Potentiel_Grele_IPG", "Indice de Potentiel Grêle (IPG)", "/100", (0, 100)),
        "orages_simules": ("03_Orages_Simules_Radar_dBZ", "Réflectivité Radar Simulée", "dBZ", (5, 65)),
        "instabilite": ("04_Instabilite_MUCAPE_Jkg", "Instabilité Convective (MUCAPE)", "J/kg", (0, 3500)),
        "rafales_convectives": ("05_Rafales_Convectives_kmh", "Rafales sous Orages", "km/h", (0, 150)),
        "ipt": ("06_Potentiel_Tornadique_IPT", "Indice Potentiel Tornadique (IPT)", "/100", (0, 100))
    },
    "02_TEMPERATURE": {
        "temperature": ("01_Temperature_2m_C", "Température à 2 mètres", "°C", (-15, 45))
    },
    "03_PRECIPITATIONS_ET_NEIGE": {
        "pluie_1h": ("01_Pluie_Horaire_1h_mm", "Précipitations en 1 heure", "mm/h", (0, 50)),
        "pluie_cumul": ("02_Pluie_Cumulee_Totale_mm", "Précipitations Cumulées Totales", "mm", (0, 150)),
        "neige": ("03_Chutes_de_Neige_1h_mm", "Chutes de Neige en 1 heure", "cm/h", (0, 20)),
        "neige_au_sol": ("04_Epaisseur_Neige_au_Sol_cm", "Épaisseur de Neige au Sol", "cm", (0, 100)),
        "graupel": ("05_Gresil_Graupel_mm", "Grésil / Graupel", "mm", (0, 25))
    },
    "04_VENTS_ET_RAFALES": {
        "vent": ("01_Vent_Moyen_10m_kmh", "Vent Moyen à 10 mètres", "km/h", (0, 120)),
        "rafales": ("02_Rafales_Instantanees_10m_kmh", "Rafales de Vent à 10m", "km/h", (0, 160)),
        "rafales_cumul": ("03_Rafales_Max_Cumulees_kmh", "Rafales Maximales Cumulées", "km/h", (0, 160))
    }
}

REGION_KEY_LAYERS = ["temperature", "pluie_1h", "pluie_cumul", "vent", "rafales", "ipg"]
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
    '01_HAUTS_DE_FRANCE': {'lat': 49.85, 'lon': 2.82, 'scale': 2.65, 'title': 'Hauts-de-France'},
    '02_NORMANDIE': {'lat': 48.95, 'lon': -0.07, 'scale': 2.85, 'title': 'Normandie'},
    '03_ILE_DE_FRANCE': {'lat': 48.65, 'lon': 2.50, 'scale': 4.20, 'title': 'Île-de-France'},
    '04_GRAND_EST': {'lat': 48.65, 'lon': 5.80, 'scale': 2.25, 'title': 'Grand Est'},
    '05_BRETAGNE': {'lat': 48.00, 'lon': -3.08, 'scale': 2.80, 'title': 'Bretagne'},
    '06_PAYS_DE_LA_LOIRE': {'lat': 47.30, 'lon': -0.85, 'scale': 2.75, 'title': 'Pays de la Loire'},
    '07_CENTRE_VAL_DE_LOIRE': {'lat': 47.45, 'lon': 1.60, 'scale': 2.55, 'title': 'Centre-Val de Loire'},
    '08_BOURGOGNE_FRANCHE_COMTE': {'lat': 47.10, 'lon': 5.00, 'scale': 2.65, 'title': 'Bourgogne-Franche-Comté'},
    '09_NOUVELLE_AQUITAINE': {'lat': 44.95, 'lon': 0.40, 'scale': 1.85, 'title': 'Nouvelle-Aquitaine'},
    '10_AUVERGNE_RHONE_ALPES': {'lat': 45.30, 'lon': 4.65, 'scale': 2.25, 'title': 'Auvergne-Rhône-Alpes'},
    '11_OCCITANIE': {'lat': 43.50, 'lon': 2.25, 'scale': 2.25, 'title': 'Occitanie'},
    '12_PACA': {'lat': 43.85, 'lon': 6.00, 'scale': 2.85, 'title': 'PACA'},
    '13_CORSE': {'lat': 42.10, 'lon': 9.05, 'scale': 4.20, 'title': 'Corse'}
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
    REGION_CROPS[r_name] = (x0, y0, x1, y1, cfg['title'])

README_INDEX_TEXT = """===============================================================================
ARCHIVES METEO « PHOTOS D'ANTENNE » WebP (.webp) — AROME HD METEO-FRANCE
===============================================================================
Date de l'archive : {date_str}
Rendu visuel : Photos d'antenne 100% completes avec Logo, Titre, Echeance et Echelle
Format : WebP haute qualite ultra-compresse (~20 a 30 Ko par photo)

ORGANISATION :
- 00_FRANCE_ENTIERE/
    * 01_ORAGES_ET_GRELE (Photos completes IPO, IPG, Radar dBZ, CAPE, Rafales, IPT)
    * 02_TEMPERATURE (Photos completes Temperature 2m C)
    * 03_PRECIPITATIONS_ET_NEIGE (Photos completes Pluie 1h, Cumuls, Neige 1h, Neige sol, Gresil)
    * 04_VENTS_ET_RAFALES (Photos completes Vent moyen 10m, Rafales instantanees, Rafales max)

- 01_HAUTS_DE_FRANCE/ a 13_CORSE/
    * Photos completes cadrees sur chaque region (Temperature, Pluie, Rafales, Grele...)

- 05_SYNTHESES_QUOTIDIENNES_24H/
    * Photos de synthese 24h maximales (Max Grele, Cumul Pluie, Rafales Max)
===============================================================================
"""

def draw_broadcast_overlays(img, param_title, unit_str, min_val, max_val, lead_hour, region_title="France Entière"):
    w, h = img.size
    draw = ImageDraw.Draw(img, "RGBA")
    
    # 1. Top-Left Cartouche
    box_w = min(480, int(w * 0.48))
    box_h = 76
    draw.rounded_rectangle((16, 16, 16 + box_w, 16 + box_h), radius=8, fill=(11, 18, 32, 230), outline=(56, 189, 248, 160), width=1)
    
    draw.text((26, 22), f"AROME HD 1,3 km • {param_title}", fill=(56, 189, 248, 255))
    draw.text((26, 42), f"Échéance H+{lead_hour:02d} • {region_title}", fill=(255, 255, 255, 255))
    draw.text((26, 60), "MÉTÉO-CLIMAT PRO — Météo-France", fill=(148, 163, 184, 255))

    # 2. Top-Right Brand Badge
    draw.rounded_rectangle((w - 180, 16, w - 16, 52), radius=6, fill=(11, 18, 32, 230), outline=(255, 215, 0, 140), width=1)
    draw.text((w - 170, 24), "MÉTÉO-CLIMAT", fill=(255, 255, 255, 255))
    draw.text((w - 60, 24), "PRO", fill=(0, 210, 255, 255))

    # 3. Bottom-Left Color Legend Scale
    leg_w = min(320, int(w * 0.36))
    leg_h = 58
    ly0 = h - leg_h - 16
    draw.rounded_rectangle((16, ly0, 16 + leg_w, h - 16), radius=6, fill=(11, 18, 32, 230), outline=(56, 189, 248, 120), width=1)
    draw.text((26, ly0 + 6), f"Échelle ({unit_str})", fill=(203, 213, 225, 255))
    
    bar_w = leg_w - 24
    for x in range(bar_w):
        val_norm = x / float(bar_w)
        r = int(min(255, max(0, val_norm * 2 * 255)))
        b = int(min(255, max(0, (1 - val_norm * 1.5) * 255)))
        g = int(min(255, max(0, math.sin(val_norm * math.pi) * 255)))
        draw.line((28 + x, ly0 + 26, 28 + x, ly0 + 34), fill=(r, g, b, 255))
    
    draw.text((28, ly0 + 38), f"{min_val}", fill=(148, 163, 184, 255))
    draw.text((28 + bar_w // 2 - 10, ly0 + 38), f"{(min_val + max_val) // 2}", fill=(148, 163, 184, 255))
    draw.text((28 + bar_w - 20, ly0 + 38), f"{max_val}", fill=(148, 163, 184, 255))

def process_single_photo(task):
    src_f, dst_f, fond_img, front_img, crop_box, target_size, param_title, unit_str, min_val, max_val, lead_hour, region_title = task
    try:
        with Image.open(src_f) as weather_layer:
            weather_rgba = weather_layer.convert("RGBA")
            comp = Image.alpha_composite(fond_img, weather_rgba)
            comp = Image.alpha_composite(comp, front_img).convert("RGB")
            if crop_box:
                comp = comp.crop(crop_box)
            comp_small = comp.resize(target_size, Image.Resampling.LANCZOS)
            
            # Draw professional broadcast overlays
            draw_broadcast_overlays(comp_small, param_title, unit_str, min_val, max_val, lead_hour, region_title)
            
            with open(dst_f, "wb") as f_out:
                comp_small.save(f_out, "WEBP", quality=70, method=6)
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

    temp_root = f"temp_archive_broadcast_{date_str}"
    if os.path.exists(temp_root):
        try:
            shutil.rmtree(temp_root, ignore_errors=True)
        except Exception:
            pass
    os.makedirs(temp_root, exist_ok=True)

    print(f"📦 Preparation des photos d'antenne WebP pour {date_str}...")

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
        for layer_key, (clean_name, param_title, unit_str, (min_v, max_v)) in layer_map.items():
            src_layer = os.path.join(maps_dir, layer_key)
            if os.path.exists(src_layer):
                dst_layer = os.path.join(cat_dir, clean_name)
                os.makedirs(dst_layer, exist_ok=True)
                for f in os.listdir(src_layer):
                    base_name, ext = os.path.splitext(f)
                    if ext.lower() in [".webp", ".png"] and (base_name in TRI_HOURLY_STEPS or len(base_name) != 3):
                        src_f = os.path.join(src_layer, f)
                        dst_f = os.path.join(dst_layer, f"{base_name}.webp")
                        lead_h = int(base_name) if base_name.isdigit() else 0
                        tasks.append((src_f, dst_f, fond_img, front_img, None, (1000, 745), param_title, unit_str, min_v, max_v, lead_h, "France Entière"))

    # 2. 13 Regions
    for r_name, (rx0, ry0, rx1, ry1, reg_title) in REGION_CROPS.items():
        r_dir = os.path.join(temp_root, r_name)
        os.makedirs(r_dir, exist_ok=True)
        for layer_key in REGION_KEY_LAYERS:
            # Find layer info
            p_title, u_str, min_v, max_v = "Paramètre", "", 0, 100
            for c_dict in CATEGORIES.values():
                if layer_key in c_dict:
                    _, p_title, u_str, (min_v, max_v) = c_dict[layer_key]
                    break
            
            src_layer = os.path.join(maps_dir, layer_key)
            if os.path.exists(src_layer):
                for step_code in sorted(TRI_HOURLY_STEPS):
                    src_f = os.path.join(src_layer, f"{step_code}.webp")
                    if not os.path.exists(src_f):
                        src_f = os.path.join(src_layer, f"{step_code}.png")
                    if os.path.exists(src_f):
                        dst_f = os.path.join(r_dir, f"{layer_key}_H{step_code}.webp")
                        lead_h = int(step_code) if step_code.isdigit() else 0
                        tasks.append((src_f, dst_f, fond_img, front_img, (rx0, ry0, rx1, ry1), (800, 600), p_title, u_str, min_v, max_v, lead_h, reg_title))

    # 3. Syntheses 24h
    synth_dir = os.path.join(temp_root, "05_SYNTHESES_QUOTIDIENNES_24H")
    os.makedirs(synth_dir, exist_ok=True)
    for f in os.listdir(maps_dir):
        if "_24h_" in f and f.endswith((".webp", ".png")):
            base_name, _ = os.path.splitext(f)
            src_f = os.path.join(maps_dir, f)
            dst_f = os.path.join(synth_dir, f"{base_name}.webp")
            tasks.append((src_f, dst_f, fond_img, front_img, None, (1000, 745), "Synthèse Quotidienne 24h", "Max", 0, 100, 24, "France Entière"))

    print(f"🚀 Execution multi-thread de {len(tasks)} photos d'antenne...")
    with ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(process_single_photo, tasks))
    
    img_count = sum(1 for r in results if r)

    # 4. README
    with open(os.path.join(temp_root, "LISEZ-MOI_INDEX.txt"), "w", encoding="utf-8") as rf:
        rf.write(README_INDEX_TEXT.format(date_str=date_str))

    # 5. Compression ZIP Niveau 9
    print(f"🗜️ Compression ZIP maximale (niveau 9) vers {out_zip_name} ({img_count} photos WebP)...")
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
    print(f"✅ Archive PHOTOS D'ANTENNE WebP {out_zip_name} terminée : {zip_size_mb:.2f} Mo ({img_count} photos) !")
    return out_zip_name, zip_size_mb, img_count

if __name__ == "__main__":
    package_daily_archive()
