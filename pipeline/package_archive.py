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

# Pas de temps tri-horaire officiel (Méthode Météociel standard)
TRI_HOURLY_STEPS = {f"{h:03d}" for h in range(0, 52, 3)}

README_METEOCIEL = """===============================================================================
ARCHIVES METEO COMPACTES (METHODE METEOCIEL) — MODELE AROME METEO-FRANCE
===============================================================================
Date de l'archive : {date_str}
Format : Standard Web Météo (1100 x 820 px optimisé ~15 Ko/image)
Échéances : Pas tri-horaire de référence (H+00, H+03, H+06, H+09, H+12... H+48, H+51)
Synthèses : 24h maximales (Grêle Max, Orages Max, Cumul Pluie, Rafales Max)

ORGANISATION :
- 00_FRANCE_ENTIERE/ (Les 30 paramètres météo classés en 5 catégories)
- 01_SYNTHESES_QUOTIDIENNES_24H/ (Les cartes résumés J0 et J+1)
===============================================================================
"""

def package_daily_archive(maps_dir="output/arome/maps", out_zip_name=None):
    if not os.path.exists(maps_dir):
        print(f"Erreur : Répertoire {maps_dir} introuvable.")
        return None

    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    if not out_zip_name:
        out_zip_name = f"arome_cartes_{date_str}.zip"

    temp_root = f"temp_archive_meteociel_{date_str}"
    if os.path.exists(temp_root):
        shutil.rmtree(temp_root)
    os.makedirs(temp_root, exist_ok=True)

    print(f"📦 Génération de l'archive légère Méthode Météociel pour {date_str}...")

    # 1. Cartes France au format optimisé Météociel (1100x820, pas de 3h)
    france_dir = os.path.join(temp_root, "00_FRANCE_ENTIERE")
    img_count = 0
    
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
                        dst_f = os.path.join(dst_layer, f)
                        try:
                            with Image.open(src_f) as img:
                                # Redimensionner proprement à 1100x820 (divisé par 2)
                                w, h = img.size
                                img_small = img.resize((w // 2, h // 2), Image.Resampling.LANCZOS)
                                img_small.save(dst_f, "WEBP", quality=75, method=6)
                                img_count += 1
                        except Exception:
                            shutil.copy2(src_f, dst_f)
                            img_count += 1

    # 2. Synthèses 24h
    synth_dir = os.path.join(temp_root, "01_SYNTHESES_QUOTIDIENNES_24H")
    os.makedirs(synth_dir, exist_ok=True)
    for f in os.listdir(maps_dir):
        if "_24h_" in f and f.endswith((".webp", ".png")):
            src_f = os.path.join(maps_dir, f)
            dst_f = os.path.join(synth_dir, f)
            try:
                with Image.open(src_f) as img:
                    w, h = img.size
                    img_small = img.resize((w // 2, h // 2), Image.Resampling.LANCZOS)
                    img_small.save(dst_f, "WEBP", quality=75, method=6)
            except Exception:
                shutil.copy2(src_f, dst_f)

    # 3. README_INDEX.txt
    readme_path = os.path.join(temp_root, "LISEZ-MOI_INDEX.txt")
    with open(readme_path, "w", encoding="utf-8") as rf:
        rf.write(README_METEOCIEL.format(date_str=date_str))

    # 4. Compression ZIP
    print(f"🗜️ Compression vers {out_zip_name}...")
    with zipfile.ZipFile(out_zip_name, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        for root, dirs, files in os.walk(temp_root):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, temp_root)
                zipf.write(file_path, arcname)

    shutil.rmtree(temp_root)
    zip_size_mb = os.path.getsize(out_zip_name) / (1024 * 1024)
    print(f"✅ Archive Méthode Météociel {out_zip_name} créée : {zip_size_mb:.2f} Mo ({img_count} cartes) !")
    return out_zip_name

if __name__ == "__main__":
    package_daily_archive()
