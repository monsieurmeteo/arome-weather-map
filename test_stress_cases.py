import os
import sys
import json
import threading
import time

BASE_DIR = r"C:\Users\grego\Documents\METEO_CLIMAT\meteo cnews 2"
OUT_DIR = r"C:\Users\grego\Desktop\EXEMPLES_CARTES_PAR_PARAMETRE\TESTS_ROBUSTESSE"
os.makedirs(OUT_DIR, exist_ok=True)

sys.path.insert(0, BASE_DIR)
import generate_meteociel_obs_maps as gmap

STRESS_CONFIGS = [
    {
        "name": "01_Stress_Tmin_Régions_Longues_Négatives",
        "date": "20260720",
        "date_fr": "20 juillet 2026",
        "param": "tmin",
        "param_label": "Température minimale",
        "zone": "region",
        "zone_label": "Provence-Alpes-Côte d'Azur",
        "filter_label": "Bourgogne-Franche-Comté",
        "stations": [
            {"name": "Chamonix – Aiguille du Midi", "dept": "74", "value": -24.8, "is_record_a": True, "rec_val": -22.5, "rec_date": "2012-02-05"},
            {"name": "Saint-Martin-de-Ré – Port des Salines", "dept": "17", "value": -18.4, "is_record_m": True, "rec_val": -16.0, "rec_date": "2018-02-28"},
            {"name": "Saint-Hilaire-du-Rosier - Gare SNCF", "dept": "38", "value": -15.2, "is_record_m": False},
            {"name": "Bourg-Saint-Maurice - Le Village", "dept": "73", "value": -12.9, "is_record_m": False},
            {"name": "Clermont-Ferrand Aulnat Aéroport Pro", "dept": "63", "value": -10.1, "is_record_m": False}
        ]
    },
    {
        "name": "02_Stress_Precip_Cumuls_Superieurs_1000mm",
        "date": "20260720",
        "date_fr": "20 juillet 2026",
        "param": "precip",
        "param_label": "Cumul de précipitations",
        "zone": "region",
        "zone_label": "Auvergne-Rhône-Alpes",
        "filter_label": "Languedoc-Roussillon",
        "stations": [
            {"name": "Valleraugue - Le Mas de la Barque", "dept": "30", "value": 1248.5, "is_record_a": True, "rec_val": 1150.0, "rec_date": "2020-09-19"},
            {"name": "Saint-Gervais-sur-Mare - Station Météo", "dept": "34", "value": 848.2, "is_record_m": True, "rec_val": 710.0, "rec_date": "2014-10-06"},
            {"name": "Villefort - Pied-de-Borne Viaduc", "dept": "48", "value": 589.6, "is_record_m": False},
            {"name": "Chamonix-Mont-Blanc - Glacier Bossons", "dept": "74", "value": 442.3, "is_record_m": False},
            {"name": "Le Barcarès - Port de Plaisance", "dept": "66", "value": 298.4, "is_record_m": False}
        ]
    },
    {
        "name": "03_Stress_Gust_Tempete_Ouragan_Badges",
        "date": "20260720",
        "date_fr": "20 juillet 2026",
        "param": "gust",
        "param_label": "Rafales maximales",
        "zone": "france",
        "zone_label": "France entière",
        "stations": [
            {"name": "Pointe du Raz - Phare de la Vieille", "dept": "29", "value": 215.0, "is_record_a": True, "rec_val": 198.0, "rec_date": "1999-12-26"},
            {"name": "Cap Corse - Sémaphore de Ersa", "dept": "2B", "value": 188.0, "is_record_m": True, "rec_val": 178.0, "rec_date": "2018-01-03"},
            {"name": "Mont Aigoual - Observatoire Climat", "dept": "30", "value": 176.0, "is_record_m": False},
            {"name": "Saint-Nazaire - Aéroport de Montoir", "dept": "44", "value": 152.0, "is_record_m": False},
            {"name": "Cherbourg-en-Cotentin - Cap de la Hague", "dept": "50", "value": 148.0, "is_record_m": False}
        ]
    },
    {
        "name": "04_Stress_Bilan_Jour_Intitules_Longs_TikTok",
        "date": "20260720",
        "date_fr": "20 juillet 2026",
        "param": "bilan_jour",
        "param_label": "Bilan du jour",
        "zone": "france",
        "zone_label": "France",
        "stations": [
            {"label": "Tmax la plus chaude", "name": "Saint-Martin-de-Ré – Port des Salines (17)", "value": 42.8, "theme": "hot", "is_record_a": True, "is_record_m": False},
            {"label": "Tmin la plus fraîche", "name": "Chamonix-Mont-Blanc – Glacier Bossons (74)", "value": -14.2, "theme": "cold", "is_record_a": False, "is_record_m": True},
            {"label": "Rafale la plus forte", "name": "Pointe du Raz – Phare de la Vieille (29)", "value": 215.0, "theme": "wind", "is_record_a": False, "is_record_m": False},
            {"label": "Pluie la plus forte", "name": "Valleraugue – Mas de la Barque (30)", "value": 1248.5, "theme": "rain", "is_record_a": True, "is_record_m": False}
        ]
    }
]

print("🚀 Lancement du test de robustesse ultime (Cumuls > 1000 mm, stations longues & régions 2 lignes)...")
t = threading.Thread(target=gmap.run_server, daemon=True)
t.start()
time.sleep(1)

for idx, cfg in enumerate(STRESS_CONFIGS, 1):
    print(f"\n[{idx}/4] Test de stress ultime : {cfg['name']}...")
    json_path = os.path.join(BASE_DIR, "meteociel_obs_data.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False)
    
    for mode in ['landscape', 'portrait']:
        filename = f"{cfg['name']}_{mode}.jpg"
        out_path = os.path.join(OUT_DIR, filename)
        ok = gmap.render_one(cfg['param'], mode, out_path, mm="0")
        if ok:
            print(f"  ✅ Généré ({mode}) → {filename}")
        else:
            print(f"  ❌ Erreur ({mode})")

print("\n" + "═"*65)
print("  TERMINÉ — Toutes les cartes de robustesse ultime sont générées !")
print(f"  📂 {OUT_DIR}")
print("═"*65)
