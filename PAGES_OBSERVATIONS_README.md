# 🗺️ Pages Observations - Style Météo NPDC

## ✅ **Deux nouvelles pages créées**

Inspirées de https://meteo-npdc.fr, voici les deux pages d'observations en temps réel :

---

## 📍 **Page 1 : Carte Interactive**

**URL** : `/observations/carte`

### Fonctionnalités

- **Carte de France** avec tous les points de stations
- **4 modes d'affichage** :
  - 🌡️ **Température** (couleurs du bleu au rouge)
  - 💨 **Vent** (vert à rouge selon la vitesse)
  - 💧 **Humidité** (orange à bleu selon le taux)
  - ☁️ **Précipitations** (gris à bleu foncé)

- **Légende dynamique** qui change selon le mode
- **Popup de détails** au clic sur une station :
  - Température et point de rosée
  - Humidité
  - Vent (vitesse, rafales, direction)
  - Précipitations
  - Position GPS

- **Actualisation automatique** toutes les 30 secondes
- **Bouton refresh manuel**

### Code couleur Température
- 🔵 Bleu foncé : < -10°C
- 🔵 Bleu : -10 à 0°C
- 🔵 Bleu clair : 0 à 5°C
- 🔵 Cyan : 5 à 10°C
- 🟢 Vert : 10 à 15°C
- 🟢 Vert clair : 15 à 20°C
- 🟠 Orange : 20 à 25°C
- 🟠 Orange foncé : 25 à 30°C
- 🔴 Rouge : > 30°C

---

## 📋 **Page 2 : Liste des Stations**

**URL** : `/observations/liste-stations`

### Fonctionnalités

- **Tableau complet** de toutes les stations
- **Colonnes** :
  - Station (ID INSEE)
  - Département
  - Température (colorée)
  - Humidité
  - Vent
  - Précipitations
  - Position GPS

- **Tri par colonne** (clic sur l'en-tête)
  - Ascendant / Descendant
  - Indicateur visuel (↑ ↓)

- **Recherche en temps réel**
  - Par ID de station
  - Par nom de département

- **Filtres avancés**
  - Plage de température (min/max)
  - Extensible pour d'autres paramètres

- **Export CSV** complet
  - Téléchargement instantané
  - Toutes les données visibles

- **Actualisation automatique** toutes les 30 secondes

---

## 🚀 **Comment utiliser**

### 1. Démarrer la collecte

Avant d'accéder aux pages, **démarrez la collecte** :
1. Allez sur `/observations/national`
2. Cliquez sur "Démarrer"
3. Attendez 10-15 secondes

### 2. Accéder aux pages

**Carte Interactive** :
```
http://localhost:5173/observations/carte
```

**Liste des Stations** :
```
http://localhost:5173/observations/liste-stations
```

Ou utilisez le menu **Observations** dans la sidebar.

---

## 🎨 **Design**

### Style général
- **Couleurs** : Gradient violet/bleu (#667eea → #764ba2)
- **Cartes blanches** avec ombres douces
- **Boutons** : Transitions fluides
- **Responsive** : S'adapte aux mobiles

### Carte Interactive
- **SVG** pour la carte (léger et rapide)
- **Points colorés** selon le paramètre
- **Animation pulse** sur la station sélectionnée
- **Popup** avec tous les détails

### Liste des Stations
- **Tableau moderne** avec hover effects
- **Sticky header** (en-têtes fixes au scroll)
- **Couleurs dynamiques** pour les températures
- **Icônes** pour chaque paramètre

---

## 📊 **Données affichées**

### Paramètres disponibles

| Paramètre | Unité | Disponible Carte | Disponible Liste |
|-----------|-------|------------------|------------------|
| Température | °C | ✅ | ✅ |
| Point de rosée | °C | ✅ (popup) | ❌ |
| Humidité | % | ✅ | ✅ |
| Vent | km/h | ✅ | ✅ |
| Rafales | km/h | ✅ (popup) | ❌ |
| Direction vent | ° | ✅ (popup) | ❌ |
| Précipitations | mm | ✅ | ✅ |
| Position GPS | °N, °E | ✅ | ✅ |

---

## 🔧 **Fonctionnalités techniques**

### Actualisation automatique
```javascript
// Refresh toutes les 30 secondes
useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
}, []);
```

### Tri de tableau
- Clic sur une colonne pour trier
- Alterne entre ascendant/descendant
- Gère les valeurs nulles (toujours en dernier)

### Export CSV
- Format standard : `station,département,temp,humidité,vent,pluie,lat,lon`
- Nom de fichier : `stations-meteo-YYYY-MM-DD.csv`
- Compatible Excel et Google Sheets

### Filtres
- Filtre température : plage min/max
- Recherche : insensible à la casse
- Combinables (recherche + filtre)

---

## 📱 **Responsive**

### Desktop (> 1200px)
- Carte et légende côte à côte
- Tableau complet avec toutes les colonnes
- Popup à droite de la carte

### Tablet (768px - 1200px)
- Carte et légende empilées
- Tableau avec scroll horizontal
- Popup centré

### Mobile (< 768px)
- Modes d'affichage sur 2 lignes
- Colonnes GPS masquées
- Popup en plein écran

---

## 🎯 **Avantages vs Réseau National**

| Fonctionnalité | Réseau National | Carte Interactive | Liste Stations |
|----------------|-----------------|-------------------|----------------|
| Vue d'ensemble | ❌ | ✅ Carte | ✅ Tableau |
| Détails station | ✅ | ✅ Popup | ✅ Ligne |
| Graphiques | ✅ | ❌ | ❌ |
| Export | ✅ JSON | ❌ | ✅ CSV |
| Filtres | ✅ Département | ✅ Mode | ✅ Multi |
| Recherche | ❌ | ❌ | ✅ |
| Tri | ❌ | ❌ | ✅ |

---

## 🔮 **Améliorations futures possibles**

### Carte Interactive
- [ ] Vraie carte géographique (Leaflet/Mapbox)
- [ ] Zoom et pan
- [ ] Clustering des stations
- [ ] Heatmap (interpolation)
- [ ] Animation temporelle

### Liste des Stations
- [ ] Plus de filtres (vent, humidité, pluie)
- [ ] Pagination (si > 1000 stations)
- [ ] Sélection multiple pour export
- [ ] Comparaison entre stations
- [ ] Graphiques inline

---

## 📖 **Exemples d'utilisation**

### Trouver les stations les plus chaudes
1. Allez sur "Liste des Stations"
2. Cliquez sur "Température" pour trier
3. Les plus chaudes sont en haut (ou en bas selon le tri)

### Voir la répartition des températures
1. Allez sur "Carte Interactive"
2. Sélectionnez "Température"
3. Visualisez les zones chaudes/froides

### Exporter les données du jour
1. Allez sur "Liste des Stations"
2. Cliquez sur "Exporter CSV"
3. Ouvrez dans Excel

### Trouver une station spécifique
1. Allez sur "Liste des Stations"
2. Tapez le département ou l'ID dans la recherche
3. La liste se filtre automatiquement

---

**Dernière mise à jour** : 18 janvier 2026 - 20:50
**Version** : 1.0 - Style Météo NPDC
