#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
package_archive.py — Générateur d'archive ZIP structurée des cartes AROME
========================================================================
Organise les cartes en dossiers explicites :
- 00_FRANCE_ENTIERE (30 paramètres en 5 catégories)
- 01 à 13 (Les 13 Régions administratives françaises)
- 14_SYNTHESES_QUOTIDIENNES_24H
- LISEZ-MOI_INDEX.txt (Guide complet, seuils et unités)
"""

import os
import shutil
import zipfile
from datetime import datetime
from PIL import Image

CATEGORIES = {
    "01_ORAGES_ET_GRELE": {
        "ipo": "01_Potentiel_Orageux_IPO",
        "ipg": "02_Potentiel_Grele_IPG",
        "orages_simules": "03_Orages_Simules_Radar_dBZ",
        "instabilite": "04_Instabilite_MUCAPE_Jkg",
        "rafales_convectives": "05_Rafales_Convectives_kmh",
        "ipt": "06_Potentiel_Tornadique_IPT"
    },
    "02_TEMPERATURES_ET_CONFORT": {
        "temperature": "01_Temperature_2m_C",
        "temperature_ressentie": "02_Temperature_Ressentie_WindChill",
        "point_rosee": "03_Point_de_Rosee_C",
        "humidex": "04_Indice_Humidex",
        "humidite": "05_Humidite_Relative_pct"
    },
    "03_PRECIPITATIONS_ET_NEIGE": {
        "pluie_1h": "01_Pluie_Horaire_1h_mm",
        "pluie_cumul": "02_Pluie_Cumulee_Totale_mm",
        "neige": "03_Chutes_de_Neige_1h_mm",
        "neige_au_sol": "04_Epaisseur_Neige_au_Sol_cm",
        "equivalent_eau_neige": "05_Equivalent_Eau_Neige_mm",
        "graupel": "06_Gresil_Graupel_mm"
    },
    "04_VENTS_ET_RAFALES": {
        "vent": "01_Vent_Moyen_10m_kmh",
        "rafales": "02_Rafales_Instantanees_10m_kmh",
        "rafales_cumul": "03_Rafales_Max_Cumulees_kmh"
    },
    "05_NUAGES_ET_PRESSION": {
        "nebulosite": "01_Nebulosite_Totale_pct",
        "nuages_bas": "02_Nuages_Bas_Brouillard_pct",
        "nuages_moyens": "03_Nuages_Moyens_pct",
        "nuages_eleves": "04_Nuages_Eleves_pct",
        "pression": "05_Pression_Mer_MSLP_Isobares_hPa",
        "pression_surface": "06_Pression_Surface_hPa"
    }
}

REGION_CROPS = {
    "01_HAUTS_DE_FRANCE":         (850, 80, 1650, 650),
    "02_ILE_DE_FRANCE":           (950, 420, 1500, 850),
    "03_NORMANDIE":               (550, 300, 1250, 800),
    "04_BRETAGNE":                (150, 450, 850, 950),
    "05_PAYS_DE_LA_LOIRE":        (450, 600, 1150, 1100),
    "06_CENTRE_VAL_DE_LOIRE":     (750, 550, 1450, 1050),
    "07_GRAND_EST":               (1250, 250, 2050, 850),
    "08_BOURGOGNE_FRANCHE_COMTE": (1150, 650, 1850, 1150),
    "09_NOUVELLE_AQUITAINE":      (450, 900, 1350, 1550),
    "10_AUVERGNE_RHONE_ALPES":    (1050, 850, 1850, 1450),
    "11_OCCITANIE":               (700, 1150, 1550, 1640),
    "12_PACA_COTE_D_AZUR":        (1350, 1050, 2050, 1550),
    "13_CORSE":                   (1800, 1250, 2180, 1640),
}

README_CONTENT = """===============================================================================
ARCHIVES METEO HAUTE RESOLUTION — MODELE AROME METEO-FRANCE
===============================================================================
Date de l'archive : {date_str}
Domaine : France Metropolitaine & 13 Regions Administratives
Resolution : Haute Definition 2200 x 1640 px (AROME 0,025 deg / 1,3 km)
Echeances : H+00 a H+51 heure par heure + Syntheses 24h

-------------------------------------------------------------------------------
STRUCTURE DU DOSSIER :
-------------------------------------------------------------------------------
1. 00_FRANCE_ENTIERE/
   Contient les 30 parametres meteorologiques complets a l'echelle nationale :
   - 01_ORAGES_ET_GRELE (IPO, IPG, Radar dBZ, CAPE J/kg, Rafales, IPT)
   - 02_TEMPERATURES_ET_CONFORT (T2m, Ressentie, Rosee, Humidex, Humidite)
   - 03_PRECIPITATIONS_ET_NEIGE (Pluie 1h, Cumuls, Neige 1h, Neige sol, Gresil)
   - 04_VENTS_ET_RAFALES (Vent moyen 10m, Rafales, Rafales max cumulees)
   - 05_NUAGES_ET_PRESSION (Nebulosite, Nuages bas/brouillard, Isobares MSLP)

2. 01_HAUTS_DE_FRANCE a 13_CORSE/
   Chaque dossier regional contient les cartes recadrees et zoomees en haute
   definition pour chaque region de France.

3. 14_SYNTHESES_QUOTIDIENNES_24H/
   Cartes de synthese recapitulative maximale de la journee (Max Grele,
   Orages max, Cumuls de pluie 24h, Rafales maximales 24h).

-------------------------------------------------------------------------------
BAREMES ET SEUILS DES INDICES SEVERES :
-------------------------------------------------------------------------------
* Indice de Potentiel Orageux (IPO /100) :
  - 0 a 24   : Risque orageux nul a marginal
  - 25 a 49  : Risque orageux modere
  - 50 a 69  : Risque orageux fort (orages organises)
  - 70 a 84  : Risque orageux tres fort (orages violents)
  - 85 a 100 : Risque orageux exceptionnel / destructeur

* Indice de Potentiel Grele (IPG /100 & MESH) :
  - 0 a 24   : Pas de grele significative (< 0,5 cm)
  - 25 a 44  : Grele moderee (0,5 a 1,5 cm)
  - 45 a 64  : Grele forte (1,5 a 3 cm — degats agricoles)
  - 65 a 84  : Gros grelons (3 a 5 cm — degats carrosseries / toitures)
  - 85 a 100 : Grele geante (> 5 cm — degats majeurs)

* Indice de Potentiel Tornadique (IPT /100) :
  - Calibre selon le Significant Tornado Parameter (STP SPC/NOAA) adapte a AROME.
  - 0 a 24   : Nul / 25 a 49 : Faible / 50 a 74 : Marque / 75 a 100 : Majeur

===============================================================================
Meteo-Climat Pro / Monsieur Meteo — Donnees ouvertes Météo-France (Open Data)
===============================================================================
"""


def package_daily_archive(maps_dir="output/arome/maps", out_zip_name=None):
    if not os.path.exists(maps_dir):
        print(f"Erreur : Répertoire {maps_dir} introuvable.")
        return None

    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    if not out_zip_name:
        out_zip_name = f"arome_cartes_{date_str}.zip"

    temp_root = f"temp_archive_{date_str}"
    if os.path.exists(temp_root):
        shutil.rmtree(temp_root)
    os.makedirs(temp_root, exist_ok=True)

    print(f"📦 Structuration de l'archive complète pour {date_str}...")

    # 1. FRANCE ENTIÈRE : Tri par catégories
    france_dir = os.path.join(temp_root, "00_FRANCE_ENTIERE")
    for cat_name, layer_map in CATEGORIES.items():
        cat_dir = os.path.join(france_dir, cat_name)
        for layer_key, clean_name in layer_map.items():
            src_layer = os.path.join(maps_dir, layer_key)
            if os.path.exists(src_layer):
                dst_layer = os.path.join(cat_dir, clean_name)
                os.makedirs(dst_layer, exist_ok=True)
                for f in os.listdir(src_layer):
                    if f.endswith((".webp", ".png", ".svg")):
                        shutil.copy2(os.path.join(src_layer, f), os.path.join(dst_layer, f))

    # 2. SYNTHÈSES 24H
    synth_dir = os.path.join(temp_root, "14_SYNTHESES_QUOTIDIENNES_24H")
    os.makedirs(synth_dir, exist_ok=True)
    for f in os.listdir(maps_dir):
        if "_24h_" in f and f.endswith((".webp", ".png")):
            shutil.copy2(os.path.join(maps_dir, f), os.path.join(synth_dir, f))

    # 3. LES 13 RÉGIONS FRANÇAISES
    print("🗺️ Génération des cadrages pour les 13 régions françaises...")
    key_layers = ["ipo", "ipg", "orages_simules", "instabilite", "rafales_convectives", "temperature", "pluie_cumul", "rafales"]
    
    for reg_code, box in REGION_CROPS.items():
        reg_dir = os.path.join(temp_root, reg_code)
        for l_key in key_layers:
            src_layer = os.path.join(maps_dir, l_key)
            if os.path.exists(src_layer):
                dst_reg_layer = os.path.join(reg_dir, l_key)
                os.makedirs(dst_reg_layer, exist_ok=True)
                for f in os.listdir(src_layer):
                    if f.endswith(".webp"):
                        src_img_path = os.path.join(src_layer, f)
                        dst_img_path = os.path.join(dst_reg_layer, f)
                        try:
                            with Image.open(src_img_path) as im:
                                cropped = im.crop(box)
                                cropped.save(dst_img_path, "WEBP", quality=80)
                        except Exception:
                            pass

    # 4. FICHIER README_INDEX.txt
    readme_path = os.path.join(temp_root, "LISEZ-MOI_INDEX.txt")
    with open(readme_path, "w", encoding="utf-8") as rf:
        rf.write(README_CONTENT.format(date_str=date_str))

    # 5. COMPRESSION DU ZIP
    print(f"🗜️ Compression vers {out_zip_name}...")
    with zipfile.ZipFile(out_zip_name, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(temp_root):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, temp_root)
                zipf.write(file_path, arcname)

    shutil.rmtree(temp_root)
    zip_size_mb = os.path.getsize(out_zip_name) / (1024 * 1024)
    print(f"✅ Archive {out_zip_name} créée avec succès ({zip_size_mb:.1f} Mo) !")
    return out_zip_name


if __name__ == "__main__":
    package_daily_archive()
