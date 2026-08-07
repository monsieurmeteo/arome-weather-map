# 🌡️ Système de Monitoring Météo National - 2000+ Stations en Temps Réel

## 📋 Vue d'ensemble

Ce système collecte automatiquement les données de **plus de 2000 stations météo** en France toutes les **6 minutes** via l'API officielle Météo-France.

### ✨ Fonctionnalités

- ✅ **Collecte automatique** : Mise à jour toutes les 6 minutes
- ✅ **2000+ stations** : Couverture nationale complète
- ✅ **Temps réel** : Données fraîches avec latence < 10 minutes
- ✅ **Sauvegarde locale** : Historique des dernières heures
- ✅ **Export JSON** : Téléchargement des données
- ✅ **Filtrage** : Par département ou région
- ✅ **Visualisation** : Cartes de couleur par température
- ✅ **Gestion automatique des tokens** : Renouvellement OAuth2

---

## 🚀 Démarrage Rapide

### 1. Configuration

Créez un fichier `.env.local` à la racine du projet :

```bash
VITE_METEO_FRANCE_BASIC_AUTH=votre_basic_auth_ici
```

**Votre Basic Auth est déjà configuré et valable INDÉFINIMENT** ✅

### 2. Lancer l'application

```bash
npm run dev
```

### 3. Accéder à la page

Ouvrez votre navigateur et allez sur :
```
http://localhost:5173/observations/national
```

### 4. Démarrer la collecte

Cliquez sur le bouton **"Démarrer"** pour lancer la collecte automatique.

---

## 🔑 Authentification

### Durée de validité des codes

| Type | Code | Validité |
|------|------|----------|
| **Basic Auth** | `TWhhcjlZU3M4T...` | ♾️ **PERMANENT** |
| **Access Token** | `eyJ4NXQiOiJOel...` | ⏱️ **1 heure** |

### Renouvellement automatique

Le système **renouvelle automatiquement** les Access Tokens :
- ✅ Vérification avant chaque requête
- ✅ Renouvellement 60s avant expiration
- ✅ Aucune intervention manuelle requise

---

## 📊 Données Collectées

### Paramètres disponibles

Pour chaque station, vous obtenez :

| Paramètre | Unité | Description |
|-----------|-------|-------------|
| `temp_celsius` | °C | Température de l'air |
| `dewpoint_celsius` | °C | Point de rosée |
| `u` | % | Humidité relative |
| `wind_kmh` | km/h | Vitesse du vent |
| `gust_kmh` | km/h | Rafales de vent |
| `dd` | ° | Direction du vent |
| `rr_per` | mm | Précipitations |
| `pres` | Pa | Pression atmosphérique |

### Conversions automatiques

- ✅ **Kelvin → Celsius** : `(K - 273.15)`
- ✅ **m/s → km/h** : `(m/s × 3.6)`

---

## 💾 Sauvegarde des Données

### Stockage Local (LocalStorage)

Les données sont automatiquement sauvegardées dans le navigateur :

```javascript
// Dernières données
localStorage.getItem('meteo_latest')

// Historique (10 dernières collectes = 1h)
localStorage.getItem('meteo_history')
```

### Export JSON

Cliquez sur **"Exporter"** pour télécharger :

```json
{
  "exportedAt": "2026-01-18T20:30:00.000Z",
  "latestData": {
    "stationCount": 2011,
    "stations": [...]
  },
  "history": [...]
}
```

---

## 📈 Utilisation Avancée

### Accéder au collecteur programmatiquement

```javascript
import { meteoCollector } from './services/meteoFranceCollector';

// Démarrer la collecte
meteoCollector.startAutoCollection();

// Obtenir les dernières données
const data = meteoCollector.latestData;

// Obtenir les statistiques
const stats = meteoCollector.getStatistics();

// Arrêter la collecte
meteoCollector.stopAutoCollection();

// Exporter en JSON
meteoCollector.exportToJSON();
```

### Statistiques disponibles

```javascript
{
  totalStations: 2011,
  stationsWithTemp: 1969,
  stationsWithWind: 1850,
  temperature: {
    min: -5.2,
    max: 18.7,
    avg: 6.8
  },
  lastUpdate: "2026-01-18T20:30:00Z",
  historySize: 10
}
```

---

## 🔧 Architecture Technique

### Flux de données

```
┌─────────────────┐
│  Météo France   │
│   API OAuth2    │
└────────┬────────┘
         │ Token Request (Basic Auth)
         ▼
┌─────────────────┐
│  Access Token   │
│   (1h validité) │
└────────┬────────┘
         │ Bearer Token
         ▼
┌─────────────────┐
│  API Package    │
│  2000+ stations │
└────────┬────────┘
         │ JSON Array
         ▼
┌─────────────────┐
│  Collecteur     │
│  + Conversions  │
└────────┬────────┘
         │
         ├──► LocalStorage (sauvegarde)
         │
         └──► React State (affichage)
```

### Cycle de collecte

```
1. Calcul du dernier cycle de 6 min
   └─► Arrondi aux 6 min inférieures - 6 min de sécurité

2. Vérification du token
   └─► Si expiré : renouvellement automatique

3. Requête API
   └─► GET /paquet/stations/infrahoraire-6m

4. Traitement des données
   └─► Conversions K→°C, m/s→km/h

5. Sauvegarde
   ├─► LocalStorage (persistance)
   └─► State React (affichage)

6. Attente 6 minutes
   └─► Retour à l'étape 1
```

---

## 🛠️ Dépannage

### Problème : "Invalid Credentials"

**Cause** : Token expiré ou Basic Auth incorrect

**Solution** :
1. Vérifiez que `.env.local` contient le bon Basic Auth
2. Redémarrez le serveur de développement (`npm run dev`)
3. Le système régénérera automatiquement un token

### Problème : Aucune donnée affichée

**Cause** : Collecte non démarrée

**Solution** :
1. Cliquez sur le bouton **"Démarrer"**
2. Attendez 10-15 secondes pour la première collecte
3. Vérifiez la console pour les logs

### Problème : Données anciennes

**Cause** : Collecte arrêtée

**Solution** :
1. Vérifiez le statut (🟢 Actif / ⏸️ Pause)
2. Relancez la collecte si nécessaire

---

## 📝 Limites et Quotas

### API Météo-France

- **Quota** : 50 requêtes/minute
- **Fréquence** : 1 requête toutes les 6 minutes ✅
- **Rétention** : Données des dernières 24h uniquement

### LocalStorage

- **Limite navigateur** : ~5-10 MB
- **Historique conservé** : 10 dernières collectes (1h)
- **Nettoyage automatique** : Oui

---

## 🎯 Prochaines Améliorations

- [ ] Carte interactive avec Leaflet
- [ ] Graphiques d'évolution temporelle
- [ ] Filtres avancés (température, vent, etc.)
- [ ] Alertes personnalisées
- [ ] Export CSV
- [ ] Comparaison entre stations
- [ ] Historique sur plusieurs jours (base de données)

---

## 📞 Support

Pour toute question sur l'API Météo-France :
- 📖 Documentation : https://portail-api.meteofrance.fr
- 🌐 Portail : https://donneespubliques.meteofrance.fr

---

## ⚖️ Licence

Données fournies par **Météo-France** sous licence Open Data.
Application développée pour un usage personnel/éducatif.

---

**Dernière mise à jour** : 18 janvier 2026
