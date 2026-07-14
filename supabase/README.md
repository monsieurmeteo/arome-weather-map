# 🌤️ API Météo Maison Climat Pro — Guide d'intégration et Services API

Bienvenue sur le dépôt du moteur d'API Météo Climat Pro. Cette solution fournit une API REST performante, totalement sur-mesure et sécurisée, pour servir des données météorologiques de haute précision (prévisions jusqu'à 15 jours, données horaires, quotidiennes, et alertes climatiques).

Le service est 100% "marque blanche" (aucune mention externe), intègre les pictogrammes officiels Météo Climat Pro, un cache géographique intelligent dans PostgreSQL, et un mécanisme de limitation de requêtes (rate limiting) à la volée.

---

## 📂 Structure du projet

```text
supabase/
├── migrations/
│   └── schema.sql             # Migration de la base PostgreSQL (Tables, Index, fonctions PL/pgSQL)
├── functions/
│   └── weather/
│       └── index.ts           # Service API Deno (Routeur Hono REST, nomenclature française, résolveur cache)
├── regional_cities.json       # Liste structurée des villes et coordonnées de référence
├── test_edge_function.js      # Script de tests unitaires locaux
└── README.md                  # Ce guide de référence
```

---

## ⚡ Instructions d'installation et de déploiement

### 1. Installation de la CLI Supabase
Si ce n'est pas déjà fait, installez l'outil en ligne de commande Supabase :
```powershell
npm install -g supabase
```

### 2. Liaison avec votre instance Supabase
Connectez-vous et associez ce dossier à votre projet de base de données :
```bash
supabase login
supabase link --project-ref <votre-reference-projet>
```

### 3. Application des schémas de base de données
Exécutez la migration PostgreSQL pour créer les structures de cache, de logs et de gestion des clés :
```bash
supabase db push
```

### 4. Déploiement du Service Web API
Déployez la fonction Edge qui gère les requêtes REST :
```bash
supabase functions deploy weather --no-verify-jwt
```

---

## 🗝️ Gestion des Clés API & Sécurité

Toutes les requêtes adressées à l'API doivent obligatoirement inclure l'en-tête HTTP `x-api-key`.
Une clé maître est configurée par défaut lors de l'installation : `weather-master-key-2026-cnews`

Pour ajouter une nouvelle clé client, insérez un enregistrement dans PostgreSQL :
```sql
insert into public.api_keys (key, name, rate_limit_per_hour)
values ('votre-cle-secrete-unique', 'Application Mobile Climat Pro', 1000);
```

---

## 🗺️ Documentation des Points d'Accès (Endpoints)

Toutes les requêtes nécessitent l'en-tête de sécurité : `x-api-key: weather-master-key-2026-cnews`

### 1. GET `/forecast` (Prévisions complètes)
Retourne le bulletin complet : observations actuelles, prévisions horaires complètes et prévisions quotidiennes sur 15 jours.
**Paramètres :** `lat` et `lon`

### 2. GET `/current` (Conditions actuelles)
Retourne uniquement les observations immédiates du point géographique ciblé.
**Paramètres :** `lat` et `lon`

### 3. GET `/hourly` (Prévisions horaires)
Retourne la grille temporelle heure par heure.
**Paramètres :** `lat` et `lon`

### 4. GET `/daily` (Prévisions quotidiennes)
Retourne les prévisions quotidiennes synthétiques sur 15 jours (températures max/min, vent max, etc.).
**Paramètres :** `lat` et `lon`

### 5. GET `/region` (Prévisions groupées pour affichage carte)
Retourne en une seule requête les prévisions optimisées pour toutes les villes configurées dans une région (ex: `france_pictos`). Inclut directement les codes pictogrammes par ville.
**Paramètre :** `id`

### 6. GET `/alerts` (Moteur d'Alertes Climatiques)
Analyse les données sur les 15 prochains jours et détecte les alertes (Vent fort, Chaleur extrême, Gel, Pluie intense).
**Paramètres :** `lat` et `lon`

---

## 📚 Lexique Exhaustif des Paramètres Météo

Toutes les variables sont traduites et standardisées pour les applications Climat Pro.

### 📍 Observations Actuelles (`current`)
| Variable | Description |
| :--- | :--- |
| `temp_actuelle` | Température relevée sous abri (°C) |
| `vent_actuel` | Vitesse moyenne du vent (km/h) |
| `pictogramme` | Code officiel du pictogramme Météo Climat Pro (ex: "P1") |
| `condition_meteo` | Libellé textuel de la situation météo (ex: "Ensoleillé") |

### ⏰ Prévisions Horaires (`hourly`)
| Variable | Description |
| :--- | :--- |
| `heure` | Date et heure de l'échéance |
| `temp` | Température de l'air (°C) |
| `temp_ressentie` | Température ressentie par le corps humain (°C) |
| `humidite` | Taux d'humidité relative de l'air (%) |
| `point_de_rosee` | Température du point de rosée (°C) |
| `proba_precipitations` | Probabilité d'avoir des précipitations (%) |
| `precipitations` | Cumul total d'eau liquide sur l'heure (mm) |
| `pluie` / `averses` / `neige` | Détail des précipitations (mm) |
| `hauteur_neige` | Hauteur de neige au sol (m) |
| `vent_vitesse` | Vitesse moyenne du vent (km/h) |
| `vent_rafales` | Vitesse des rafales de vent (km/h) |
| `vent_direction` | Direction du vent en degrés (°) |
| `pression_mer` / `pression_sol` | Pression atmosphérique (hPa) |
| `nebulosite_totale` | Couverture nuageuse totale (%) |
| `nuages_bas` / `moyens` / `hauts` | Détail de la couverture nuageuse (%) |
| `visibilite` | Visibilité horizontale (mètres) |
| `temp_sol_0cm` à `54cm` | Températures du sol à différentes profondeurs (°C) |
| `humidite_sol_1cm` à `81cm` | Humidité du sol à différentes profondeurs (m³/m³) |
| `evapotranspiration` | Évapotranspiration (mm) |
| `deficit_vapeur` | Déficit de pression de vapeur (kPa) |
| `pictogramme` | Identifiant du pictogramme associé (ex: "P3") |
| `condition_meteo` | Condition météo en français |

### 📅 Synthèses Quotidiennes à 15 jours (`daily`)
| Variable | Description |
| :--- | :--- |
| `date` | Date du jour (YYYY-MM-DD) |
| `temp_max` / `temp_min` | Températures maximales et minimales (°C) |
| `ressenti_max` / `ressenti_min` | Températures ressenties maximales et minimales (°C) |
| `vent_10_max` | **Rafales maximales mesurées** au cours du jour (km/h) |
| `vent_vitesse_max` | Vitesse moyenne maximale du vent (km/h) |
| `vent_direction_dominante` | Direction dominante du vent (°) |
| `pluie_cumul` / `pluie_plaine` | Sommes totales des précipitations (mm) |
| `averses_cumul` / `neige_cumul` | Cumuls d'averses et de neige (mm/cm) |
| `heures_pluie` | Nombre d'heures de précipitations |
| `probabilite_pluie_max` | Probabilité maximale de précipitations sur la journée (%) |
| `lever_soleil` / `coucher_soleil` | Heures locales (HH:MM) |
| `index_uv` | Index UV maximal atteint à midi solaire |
| `index_uv_ciel_clair` | Index UV max sous ciel clair |
| `rayonnement_solaire` | Rayonnement solaire à courte longueur d'onde (MJ/m²) |
| `pictogramme` | Identifiant du pictogramme associé (ex: "P12") |
| `condition_meteo` | Condition météo en français |

---

## 📈 Gestion de la Performance & Cache Géographique

Pour garantir des temps de réponse inférieurs à 50ms et protéger nos serveurs d'acquisition :
1. **Arrondissement Géographique** : Les latitudes et longitudes sont arrondies à 2 décimales. Cela groupe les requêtes par cellules géographiques d'environ 1,1 km.
2. **Stockage Ultra-Rapide** : Les données structurées sont conservées au format binaire JSONB indexé dans PostgreSQL.
3. **Expiration de Cache (15 minutes)** : La validité d'un cache géographique est de 15 minutes. Lorsqu'un cache expire, la requête suivante déclenche automatiquement un rafraîchissement asynchrone auprès de nos serveurs internes pour maintenir les données à jour.
