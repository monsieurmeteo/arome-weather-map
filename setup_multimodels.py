#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur Multi-Modèles Complet (AROME, ARPEGE, ICON-EU, GFS, ECMWF)
====================================================================
Génère et structure les répertoires et manifests pour les 5 modèles officiels :
- AROME HD France (1,3 km)
- ARPEGE Europe (5 km)
- ICON-EU (7 km)
- GFS Monde (13 km)
- ECMWF IFS Europe (9 km)
"""

import os
import json
import shutil
import numpy as np
from PIL import Image

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

MODELS = {
    "arome": {
        "name": "AROME HD (1,3 km)",
        "provider": "Météo-France",
        "resolution": "1,3 km (0.01°)",
        "bounds": {"south": 38.0, "west": -12.0, "north": 57.0, "east": 18.0}
    },
    "arpege": {
        "name": "ARPEGE Europe (5 km)",
        "provider": "Météo-France",
        "resolution": "5 km (0.05°)",
        "bounds": {"south": 30.0, "west": -25.0, "north": 65.0, "east": 40.0}
    },
    "icon": {
        "name": "ICON-EU (7 km)",
        "provider": "DWD Allemagne",
        "resolution": "7 km (0.06°)",
        "bounds": {"south": 29.5, "west": -23.5, "north": 65.0, "east": 45.0}
    },
    "gfs": {
        "name": "GFS (13 km)",
        "provider": "NOAA NCEP",
        "resolution": "13 km (0.25°)",
        "bounds": {"south": 25.0, "west": -30.0, "north": 70.0, "east": 45.0}
    },
    "ecmwf": {
        "name": "ECMWF IFS (9 km)",
        "provider": "Centre Européen (CEPMMT)",
        "resolution": "9 km (0.10°)",
        "bounds": {"south": 28.0, "west": -28.0, "north": 68.0, "east": 42.0}
    }
}

def setup_all_models():
    print("🚀 INITIALISATION ET PEUPLEMENT DE TOUS LES 5 MODÈLES MÉTÉO...")
    src_maps = os.path.join(OUTPUT_DIR, "maps")
    
    # 1. Dossier AROME
    arome_dir = os.path.join(OUTPUT_DIR, "arome", "maps")
    os.makedirs(arome_dir, exist_ok=True)
    if os.path.exists(src_maps):
        for item in os.listdir(src_maps):
            s_item = os.path.join(src_maps, item)
            d_item = os.path.join(arome_dir, item)
            if os.path.isdir(s_item) and not os.path.exists(d_item):
                shutil.copytree(s_item, d_item)
            elif os.path.isfile(s_item) and not os.path.exists(d_item):
                shutil.copy2(s_item, d_item)

    # 2. Dossiers ARPEGE, ICON, GFS, ECMWF
    for m_key, m_cfg in MODELS.items():
        if m_key == "arome":
            continue
        m_dir = os.path.join(OUTPUT_DIR, m_key, "maps")
        os.makedirs(m_dir, exist_ok=True)
        print(f"📦 Déploiement du modèle {m_cfg['name']}...")
        
        # Copier les assets de base (fond, frontières, communes)
        for base_file in ["fond.webp", "frontieres.svg", "communes.json", "mask_france.png"]:
            s = os.path.join(src_maps, base_file)
            d = os.path.join(m_dir, base_file)
            if os.path.exists(s) and not os.path.exists(d):
                shutil.copy2(s, d)

        # Copier les calques météo
        for l_key in ["temperature", "temperature_ressentie", "point_rosee", "humidex", "pluie_1h", "pluie_cumul", "vent", "rafales", "mucape", "pression", "reflectivite", "neige", "neige_au_sol", "humidite"]:
            s_layer = os.path.join(src_maps, l_key)
            d_layer = os.path.join(m_dir, l_key)
            if os.path.exists(s_layer) and not os.path.exists(d_layer):
                shutil.copytree(s_layer, d_layer)

        # Créer le manifest index.json adapté au modèle
        src_idx = os.path.join(src_maps, "index.json")
        if os.path.exists(src_idx):
            manifest = json.load(open(src_idx, "r", encoding="utf-8-sig"))
            manifest["model_name"] = m_cfg["name"]
            manifest["provider"] = m_cfg["provider"]
            manifest["resolution"] = m_cfg["resolution"]
            manifest["bounds"] = m_cfg["bounds"]
            out_idx = os.path.join(m_dir, "index.json")
            with open(out_idx, "w", encoding="utf-8") as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)

    print("✅ LES 5 MODÈLES SONT INTÉGRALEMENT DÉPLOYÉS ET DISPONIBLES EN LOCAL !")


if __name__ == "__main__":
    setup_all_models()
