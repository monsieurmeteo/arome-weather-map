# ⚡ Météo AROME HD & Multi-Modèles — Cartographie 2D Haute Définition

Plateforme météorologique haute performance développée par **Météo-Climat Pro** / **Monsieur Météo**.  
Génère et affiche en direct les sorties des 5 grands modèles de prévision numérique du temps à haute résolution spatiale.

---

## 🌐 Modèles Météorologiques Intégrés

| Modèle | Résolution | Fournisseur Officiel | Serveur Source | Portée |
|---|---|---|---|---|
| **AROME HD** | **1,3 km (0.01°)** | 🇫🇷 Météo-France | `object.data.gouv.fr/meteofrance-pds/` | H+00 à H+48 |
| **ARPEGE** | **5 km (0.05°)** | 🇫🇷 Météo-France | `object.data.gouv.fr/meteofrance-pds/` | H+00 à J+4 |
| **ICON-EU** | **7 km (0.06°)** | 🇩🇪 DWD Allemagne | `opendata.dwd.de/weather/nwp/icon-eu/` | H+00 à J+3 |
| **GFS** | **13 km (0.25°)** | 🇺🇸 NOAA / NCEP | `nomads.ncep.noaa.gov/pub/data/` | H+00 à J+16 |
| **ECMWF IFS** | **9 km (0.10°)** | 🇪🇺 Centre Européen (CEPMMT) | `data.ecmwf.int/forecasts/` | H+00 à J+10 |

---

## 🎨 Calques & Paramètres Météorologiques (22 couches)

- 🌡️ **Températures** : Température 2m, Température ressentie, Point de rosée, Humidex
- 🌧️ **Précipitations & Pluie** : Pluie horaire (mm/h), Cumuls 24h/48h, Réflectivité Radar Doppler (dBZ)
- 💨 **Vent & Tempêtes** : Vent moyen à 10 m, Rafales maximales instantanées (km/h)
- ⛈️ **Orages & Instabilité** : Énergie Convective Disponible (MUCAPE J/kg)
- ❄️ **Neige & Hiver** : Chutes de neige horaire, Épaisseur au sol, Équivalent en eau, Graupel
- ☁️ **Nuages & Pression** : Nébulosité totale, Humidité relative, Pression atmosphérique mer

---

## ⚙️ Automatisation Cloud 24/7 (GitHub Actions)

Le workflow `.github/workflows/update_models.yml` s'exécute automatiquement toutes les 3 heures :
1. Téléchargement des nouveaux paquets GRIB2 officiels.
2. Décodage et interpolation des grilles haute résolution.
3. Rendu cartographique WebP 2200 × 1640 px avec application des palettes de couleurs étalonnées.
4. Publication instantanée sur **GitHub Pages**.

---

## 💻 Utilisation Locale

```bash
# Lancement du serveur local
LANCER_METEO_AROME.bat
# ou en ligne de commande :
python -m http.server 8080
```
Accès direct : **`http://localhost:8080`**

---

© 2026 Météo-Climat Pro — Tous droits réservés.
