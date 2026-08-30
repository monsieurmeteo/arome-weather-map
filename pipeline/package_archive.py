#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
package_archive.py — Générateur d'archives MÉTÉO ÉLITE « PHOTOS D'ANTENNE HD » WebP
===================================================================================
- Périmètre : France Entière + Hauts-de-France uniquement.
- Runs majeurs : 00Z et 12Z uniquement.
- Noms de fichiers explicites avec jour de la semaine et heure locale :
    ex : temperature_dimanche_14h00_H00.webp, pluie_1h_lundi_02h00_H12.webp
- Rendu d'antenne fidèle : Typographie TrueType nette (zéro carré UTF-8), Logo, Cartouche et Échelle.
- Poids ultra-léger : ~25 à 29 Mo pour l'archive complète.
"""

import os
import shutil
import zipfile
import math
import json
from datetime import datetime, timezone, timedelta
import zoneinfo
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw, ImageFont

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

HDF_KEY_LAYERS = ["temperature", "pluie_1h", "pluie_cumul", "vent", "rafales", "ipg"]
TRI_HOURLY_STEPS = {f"{h:03d}" for h in range(0, 52, 3)}
HDF_CROP = (693, 112, 1523, 730)

JOURS_FR = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]

def get_system_font(size, bold=True):
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf" if bold else "/usr/share/fonts/truetype/freefont/FreeSans.ttf"
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                pass
    return ImageFont.load_default()

def get_local_datetime_info(run_dt_utc, lead_hours):
    try:
        tz_paris = zoneinfo.ZoneInfo("Europe/Paris")
    except Exception:
        # Fallback heure d'été (+2) / hiver (+1)
        tz_paris = timezone(timedelta(hours=2))
    
    valid_dt = (run_dt_utc + timedelta(hours=lead_hours)).astimezone(tz_paris)
    jour_nom = JOURS_FR[valid_dt.weekday()]
    jour_court = jour_nom[:3]
    date_str = valid_dt.strftime("%d/%m")
    heure_str = f"{valid_dt.hour:02d}h{valid_dt.minute:02d}"
    
    label_antenne = f"{jour_court}. {date_str} {heure_str}"
    label_fichier = f"{jour_nom}_{valid_dt.strftime('%d-%m')}_{heure_str}"
    return label_antenne, label_fichier, jour_nom

README_INDEX_TEXT = """===============================================================================
ARCHIVES METEO ÉLITE « PHOTOS D'ANTENNE HD » WebP — AROME METEO-FRANCE
===============================================================================
Date et Run : {date_str} ({run_str})
Régions archivées : France Entière + Hauts-de-France
Dénomination des fichiers : Inclut le jour de la semaine, la date et l'heure locale exacte
    Exemple : temperature_dimanche_30-08_14h00_H00.webp
Format : WebP haute qualité (~70 Ko par photo HD complète)

ORGANISATION :
- 00_FRANCE_ENTIERE/
    * 01_ORAGES_ET_GRELE (Photos completes IPO, IPG, Radar dBZ, CAPE, Rafales, IPT)
    * 02_TEMPERATURE (Photos completes Temperature 2m C)
    * 03_PRECIPITATIONS_ET_NEIGE (Photos completes Pluie 1h, Cumuls, Neige 1h, Neige sol, Gresil)
    * 04_VENTS_ET_RAFALES (Photos completes Vent moyen 10m, Rafales instantanees, Rafales max)

- 01_HAUTS_DE_FRANCE/
    * Photos completes cadrees sur les Hauts-de-France avec jour et heure locale

- 02_SYNTHESES_24H/
    * Photos de synthese 24h maximales (Max Grele, Cumul Pluie, Rafales Max)
===============================================================================
"""

def draw_broadcast_card_overlay(img, param_title, unit_str, min_val, max_val, lead_hour, region_title, run_str, date_antenne_str):
    w, h = img.size
    draw = ImageDraw.Draw(img, "RGBA")
    
    f_title = get_system_font(20, bold=True)
    f_sub = get_system_font(15, bold=True)
    f_lead = get_system_font(18, bold=True)
    f_logo = get_system_font(17, bold=True)
    f_leg = get_system_font(13, bold=True)

    # 1. Cartouche d'antenne officiel (En haut à gauche)
    bw = min(500, int(w * 0.50))
    bh = 114
    draw.rounded_rectangle((20, 20, 20 + bw, 20 + bh), radius=12, fill=(7, 11, 20, 235), outline=(0, 210, 255, 200), width=2)
    
    full_title = f"{param_title} ({unit_str})" if unit_str else param_title
    draw.text((36, 32), full_title, font=f_title, fill=(255, 255, 255, 255))
    draw.text((36, 62), f"AROME HD (1,3 km) • {run_str}", font=f_sub, fill=(0, 210, 255, 255))
    draw.text((36, 88), f"Échéance H+{lead_hour:02d} • {date_antenne_str} • {region_title}", font=f_lead, fill=(255, 255, 255, 255))

    # 2. Logo Météo-Climat Pro officiel (En haut à droite)
    lw = 185
    lh = 48
    lx0 = w - lw - 20
    ly0 = 20
    draw.rounded_rectangle((lx0, ly0, lx0 + lw, ly0 + lh), radius=10, fill=(7, 11, 20, 235), outline=(255, 215, 0, 180), width=2)
    draw.text((lx0 + 14, ly0 + 14), "MÉTÉO-CLIMAT", font=f_logo, fill=(255, 255, 255, 255))
    draw.text((lx0 + 142, ly0 + 14), "PRO", font=f_logo, fill=(0, 210, 255, 255))

    # 3. Légende colorimétrique officielle en bas au centre
    leg_w = min(560, int(w * 0.62))
    leg_h = 68
    leg_x0 = (w - leg_w) // 2
    leg_y0 = h - leg_h - 20
    draw.rounded_rectangle((leg_x0, leg_y0, leg_x0 + leg_w, leg_y0 + leg_h), radius=12, fill=(7, 11, 20, 240), outline=(0, 210, 255, 180), width=2)
    
    draw.text((leg_x0 + leg_w // 2, leg_y0 + 8), full_title, font=f_leg, fill=(255, 255, 255, 255), anchor="mt")
    
    bar_w = leg_w - 48
    bar_x0 = leg_x0 + 24
    bar_y0 = leg_y0 + 28
    for x in range(bar_w):
        val_norm = x / float(bar_w)
        r = int(min(255, max(0, val_norm * 2 * 255)))
        b = int(min(255, max(0, (1 - val_norm * 1.5) * 255)))
        g = int(min(255, max(0, math.sin(val_norm * math.pi) * 255)))
        draw.line((bar_x0 + x, bar_y0, bar_x0 + x, bar_y0 + 12), fill=(r, g, b, 255))
    
    draw.text((bar_x0, bar_y0 + 16), f"{min_val}", font=f_leg, fill=(203, 213, 225, 255), anchor="lt")
    draw.text((bar_x0 + bar_w // 2, bar_y0 + 16), f"{(min_val + max_val) // 2}", font=f_leg, fill=(203, 213, 225, 255), anchor="mt")
    draw.text((bar_x0 + bar_w, bar_y0 + 16), f"{max_val}", font=f_leg, fill=(203, 213, 225, 255), anchor="rt")

def process_single_photo(task):
    src_f, dst_f, fond_img, front_img, crop_box, target_size, param_title, unit_str, min_val, max_val, lead_hour, region_title, run_str, date_antenne_str = task
    try:
        with Image.open(src_f) as weather_layer:
            weather_rgba = weather_layer.convert("RGBA")
            comp = Image.alpha_composite(fond_img, weather_rgba)
            comp = Image.alpha_composite(comp, front_img).convert("RGB")
            if crop_box:
                comp = comp.crop(crop_box)
            comp_small = comp.resize(target_size, Image.Resampling.LANCZOS)
            
            draw_broadcast_card_overlay(comp_small, param_title, unit_str, min_val, max_val, lead_hour, region_title, run_str, date_antenne_str)
            
            with open(dst_f, "wb") as f_out:
                comp_small.save(f_out, "WEBP", quality=75, method=6)
            return True
    except Exception:
        return False

def package_daily_archive(maps_dir="output/arome/maps", out_zip_name=None, only_major_runs=True):
    if not os.path.exists(maps_dir):
        print(f"Erreur : Repertoire {maps_dir} introuvable.")
        return None, 0, 0

    # 1. Lecture du manifest index.json pour identifier le run réel
    manifest_path = os.path.join(maps_dir, "index.json")
    run_dt = datetime.now(timezone.utc)
    run_hour_str = "12Z"
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, "r", encoding="utf-8") as mf:
                mdata = json.load(mf)
                r_time = mdata.get("run_time")
                if r_time:
                    run_dt = datetime.fromisoformat(r_time.replace("Z", "+00:00"))
                    run_hour_str = f"{run_dt.hour:02d}Z"
        except Exception:
            pass

    # Vérification strict des runs 00Z et 12Z (ignore 06Z et 18Z si demandé)
    if only_major_runs and run_hour_str not in ["00Z", "12Z"]:
        print(f"ℹ️ Le run actuel ({run_hour_str}) n'est ni 00Z ni 12Z. Archivage ignore selon configuration.")
        # Pour les tests manuels ou forcés, on autorise si out_zip_name est spécifié
        if not out_zip_name:
            return None, 0, 0

    try:
        tz_paris = zoneinfo.ZoneInfo("Europe/Paris")
    except Exception:
        tz_paris = timezone(timedelta(hours=2))
    
    local_run_dt = run_dt.astimezone(tz_paris)
    jour_run_nom = JOURS_FR[local_run_dt.weekday()]
    date_run_str = local_run_dt.strftime("%d-%m-%Y")
    run_label_clean = f"run_{run_hour_str.lower()}"

    if not out_zip_name:
        out_zip_name = f"arome_{jour_run_nom}_{date_run_str}_{run_label_clean}.zip"

    temp_root = f"temp_archive_hdf_{local_run_dt.strftime('%Y%m%d_%H%M')}"
    if os.path.exists(temp_root):
        try:
            shutil.rmtree(temp_root, ignore_errors=True)
        except Exception:
            pass
    os.makedirs(temp_root, exist_ok=True)

    print(f"📦 Preparation de l'archive ({jour_run_nom} {date_run_str} {run_hour_str}) pour France + Hauts-de-France...")

    fond_path = os.path.join(maps_dir, "fond.webp")
    if not os.path.exists(fond_path):
        fond_path = os.path.join(maps_dir, "fond.png")
    fond_img = Image.open(fond_path).convert("RGBA") if os.path.exists(fond_path) else Image.new("RGBA", (2200, 1640), (240, 240, 240, 255))
    
    front_path = os.path.join(maps_dir, "frontieres_overlay.png")
    if os.path.exists(front_path):
        front_img = Image.open(front_path).convert("RGBA")
    else:
        front_img = Image.new("RGBA", (2200, 1640), (0, 0, 0, 0))

    tasks = []

    # 1. France Entière
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
                        lead_h = int(base_name) if base_name.isdigit() else 0
                        lbl_antenne, lbl_fichier, _ = get_local_datetime_info(run_dt, lead_h)
                        dst_f = os.path.join(dst_layer, f"{layer_key}_{lbl_fichier}_H{lead_h:02d}.webp")
                        tasks.append((src_f, dst_f, fond_img, front_img, None, (1100, 820), param_title, unit_str, min_v, max_v, lead_h, "France Entière", f"Run {run_hour_str}", lbl_antenne))

    # 2. Hauts-de-France Uniquement
    hdf_dir = os.path.join(temp_root, "01_HAUTS_DE_FRANCE")
    os.makedirs(hdf_dir, exist_ok=True)
    for layer_key in HDF_KEY_LAYERS:
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
                    lead_h = int(step_code) if step_code.isdigit() else 0
                    lbl_antenne, lbl_fichier, _ = get_local_datetime_info(run_dt, lead_h)
                    dst_f = os.path.join(hdf_dir, f"{layer_key}_{lbl_fichier}_H{lead_h:02d}.webp")
                    tasks.append((src_f, dst_f, fond_img, front_img, HDF_CROP, (800, 600), p_title, u_str, min_v, max_v, lead_h, "Hauts-de-France", f"Run {run_hour_str}", lbl_antenne))

    # 3. Synthèses 24h
    synth_dir = os.path.join(temp_root, "02_SYNTHESES_24H")
    os.makedirs(synth_dir, exist_ok=True)
    for f in os.listdir(maps_dir):
        if "_24h_" in f and f.endswith((".webp", ".png")):
            base_name, _ = os.path.splitext(f)
            src_f = os.path.join(maps_dir, f)
            dst_f = os.path.join(synth_dir, f"{base_name}_{jour_run_nom}_{date_run_str}.webp")
            tasks.append((src_f, dst_f, fond_img, front_img, None, (1100, 820), "Synthèse Quotidienne 24h", "Max", 0, 100, 24, "France Entière", f"Run {run_hour_str}", date_run_str))

    print(f"🚀 Execution multi-thread de {len(tasks)} photos d'antenne HD...")
    with ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(process_single_photo, tasks))
    
    img_count = sum(1 for r in results if r)

    # 4. README
    with open(os.path.join(temp_root, "LISEZ-MOI_INDEX.txt"), "w", encoding="utf-8") as rf:
        rf.write(README_INDEX_TEXT.format(date_str=f"{jour_run_nom} {date_run_str}", run_str=run_hour_str))

    # 5. Compression ZIP Niveau 9
    print(f"🗜️ Compression ZIP maximale vers {out_zip_name} ({img_count} photos WebP)...")
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
    print(f"✅ Archive PHOTOS D'ANTENNE {out_zip_name} terminée : {zip_size_mb:.2f} Mo ({img_count} photos) !")
    return out_zip_name, zip_size_mb, img_count

if __name__ == "__main__":
    package_daily_archive(only_major_runs=False)
