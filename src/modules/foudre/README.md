# Module Impacts de Foudre ⚡

## Vue d'ensemble

Ce module permet de visualiser et d'analyser les impacts de foudre en France en temps réel (API Agate).
 **Note : Le mode Archives a été désactivé.**

## Composants

### 1. **FoudreFrance.jsx** (Principal)
- **Route** : `/foudre`
- **Description** : Interface principale avec carte interactive Leaflet
- **Fonctionnalités** :
  - Mode DIRECT : Données en temps réel (API Agate) avec rafraîchissement automatique
  - Sélection géographique (France/Régions/Départements)
  - Recherche de commune avec analyse de proximité
  - Export PNG haute qualité
  - Animations de clignotement pour impacts récents (<15 min)
  - Optimisation canvas pour performances élevées

### 2. **FoudreCommunes.jsx**
- **Description** : Version simplifiée pour analyse communale
- **Fonctionnalités** :
  - Recherche de commune
  - Statistiques de proximité (rayons 1-20 km)
  - Mode LIVE uniquement

### 3. **FoudreExpert.jsx**
- **Route** : `/foudre-expert`
- **Description** : Générateur de cartes SVG avec D3.js

## Sources de données

### API Agate (Temps réel)
- **Endpoint** : `/api-agate/ORAGE/orage/ws/wsOragesGMaps.php`
- **Fréquence** : Rafraîchissement toutes les 60 secondes
- **Couverture** : Dernières 24h

## Palette de couleurs chronologiques

Les impacts sont colorés selon l'heure de détection (0h-23h) :
- **0h-5h** : Bleu (nuit)
- **6h-11h** : Cyan/Vert (matin)
- **12h-17h** : Jaune/Orange (après-midi)
- **18h-23h** : Rouge/Brun (soir)

## Optimisations

### Performance
- **Canvas rendering** : Utilisation de `FastLightningLayer` pour affichage fluide
- **RequestAnimationFrame** : Animations optimisées

### UX
- **Responsive design** : Adapté mobile/desktop
- **Feedback visuel** : Loaders, animations

## Configuration requise

### Variables d'environnement
(Plus de dépendance forte à Supabase pour ce module spécifique, mais utilisé ailleurs)

### Dépendances
- `leaflet` : Cartes interactives
- `react-leaflet` : Intégration React
- `html2canvas` : Export PNG

## Utilisation

### Mode DIRECT
1. Ouvrir `/foudre`
2. La date du jour est sélectionnée automatiquement
3. Les impacts s'affichent en temps réel
4. Rafraîchissement automatique toutes les 60s

### Recherche de commune
1. Utiliser la barre de recherche
2. Sélectionner une commune
3. Les cercles de proximité s'affichent (1-20 km)
4. Les statistiques sont calculées automatiquement

## Maintenance

### Mise à jour des données
- **API Agate** : Automatique, pas d'action requise
