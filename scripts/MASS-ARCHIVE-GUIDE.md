# 🗄️ ARCHIVAGE MASSIF - Guide d'utilisation

## Vue d'ensemble

Ce script permet de générer **automatiquement toutes les images d'archive** depuis 2015 à partir des données Supabase, puis de **supprimer les données archivées** pour libérer de l'espace.

---

## ⚠️ IMPORTANT - Prérequis

### 1. Serveur de développement
Le script a besoin que le serveur dev soit **actif** :
```bash
npm run dev
```
**Laissez ce terminal ouvert pendant tout le processus !**

### 2. Espace disque
Estimations :
- **~4000 jours** (2015-2026) × **500 KB/image** = **~2 GB**
- Vérifiez que vous avez au moins **3 GB d'espace libre**

### 3. Temps d'exécution
- **~3-5 secondes par jour** (capture + suppression)
- **4000 jours** = **~3-5 heures** au total
- Le script peut être interrompu et repris (il skip les images déjà créées)

---

## 🚀 Utilisation

### Étape 1 : Lancer le serveur dev
```bash
cd c:\Users\grego\Documents\minisite-douai
npm run dev
```

### Étape 2 : Dans un NOUVEAU terminal, lancer l'archivage
```bash
node scripts/mass-archive-foudre.mjs
```

### Étape 3 : Surveiller la progression
Le script affiche en temps réel :
```
📦 Lot 1/400 (10 dates)
----------------------------------------------------------------------
   ✅ 2015-01-01 : Image créée (523 KB)
   🧹 2015-01-01 : 1,234 impacts supprimés de la base
   ⚪ 2015-01-02 : Aucun impact, skip
   ✅ 2015-01-03 : Image créée (789 KB)
   ...

📊 Progression : 10/4000 (0.3%)
   ✅ Créées: 8 | ⏭️  Skipped: 0 | ⚪ Sans données: 2 | ❌ Erreurs: 0
   🧹 Total supprimé de la base : 12,456 impacts
```

---

## 📊 Configuration

Modifiez les paramètres dans `mass-archive-foudre.mjs` :

```javascript
const START_DATE = '2015-01-01'; // Date de début
const END_DATE = '2026-01-23';   // Date de fin
const BATCH_SIZE = 10;           // Nombre de jours en parallèle (10 = optimal)
const DELAY_BETWEEN_BATCHES = 5000; // Pause entre lots (5s)
```

### Recommandations :
- **BATCH_SIZE** : 
  - `5-10` = Optimal (équilibre vitesse/stabilité)
  - `1` = Très lent mais ultra-stable
  - `20+` = Risque de crash navigateur

- **DELAY_BETWEEN_BATCHES** :
  - `5000ms` (5s) = Recommandé
  - `0ms` = Plus rapide mais risque de surcharge
  - `10000ms` (10s) = Plus lent mais très stable

---

## 🛑 Interruption et reprise

### Interrompre le script
- **Ctrl+C** dans le terminal
- Le script s'arrête proprement

### Reprendre l'archivage
- Relancer `node scripts/mass-archive-foudre.mjs`
- Le script **skip automatiquement** les images déjà créées
- Il reprend là où il s'était arrêté

---

## 📁 Résultat

### Structure des fichiers
```
public/archives-foudre/
├── bilan-foudre-2015-01-01.png
├── bilan-foudre-2015-01-02.png
├── bilan-foudre-2015-01-03.png
├── ...
└── bilan-foudre-2026-01-23.png
```

### Affichage sur le site
Une fois archivées, les images s'affichent **instantanément** :
1. Aller sur `/foudre`
2. Sélectionner une date passée
3. L'image d'archive se charge en <1s (au lieu de 10-20s avec Supabase)

---

## 🔍 Vérification

### Vérifier les archives créées
```bash
node scripts/check_foudre_status.mjs
```

Affiche :
```
🖼️  Archives images PNG...
   ✅ 3,542 image(s) d'archive trouvée(s)

   📋 Liste des archives :
      - bilan-foudre-2015-01-01.png (0.52 MB)
      - bilan-foudre-2015-01-02.png (0.78 MB)
      ...
```

### Vérifier l'espace libéré dans Supabase
```bash
node scripts/check_foudre_status.mjs
```

Avant archivage :
```
📅 Période couverte...
   📍 Plus ancien : 01/01/2015 02:07:00
   📍 Plus récent : 24/01/2026 17:17:31
```

Après archivage :
```
📅 Période couverte...
   📍 Plus ancien : 24/01/2026 00:00:00  ← Seulement aujourd'hui !
   📍 Plus récent : 24/01/2026 17:17:31
```

---

## ⚠️ Dépannage

### Erreur : "Cannot connect to localhost:5173"
**Cause** : Le serveur dev n'est pas lancé  
**Solution** : 
```bash
npm run dev
```

### Erreur : "Timeout waiting for page load"
**Cause** : Trop de données pour une date  
**Solution** : Réduire `BATCH_SIZE` à 5 ou 1

### Erreur : "ENOSPC: no space left on device"
**Cause** : Disque plein  
**Solution** : Libérer de l'espace ou changer `END_DATE`

### Le script est très lent
**Causes possibles** :
1. `BATCH_SIZE` trop bas → Augmenter à 10
2. `DELAY_BETWEEN_BATCHES` trop élevé → Réduire à 3000ms
3. Ordinateur lent → Réduire `BATCH_SIZE` à 5

### Certaines images sont vides/noires
**Cause** : Timeout trop court  
**Solution** : Augmenter le timeout ligne 91 :
```javascript
await page.goto(url, { waitUntil: 'networkidle2', timeout: 180000 }); // 3 minutes
```

---

## 📊 Estimation du temps

| Nombre de jours | BATCH_SIZE | Temps estimé |
|-----------------|------------|--------------|
| 100 jours | 10 | ~30 min |
| 365 jours (1 an) | 10 | ~2h |
| 1000 jours | 10 | ~3h30 |
| 4000 jours (11 ans) | 10 | ~5-6h |

**Conseil** : Lancez le script le soir et laissez-le tourner la nuit !

---

## 🎯 Stratégie recommandée

### Option 1 : Archivage complet (recommandé)
```javascript
const START_DATE = '2015-01-01';
const END_DATE = '2026-01-23';
```
✅ Toutes les données archivées  
✅ Base Supabase allégée au maximum  
⏱️ ~5-6 heures

### Option 2 : Archivage progressif
**Semaine 1** :
```javascript
const START_DATE = '2015-01-01';
const END_DATE = '2020-12-31';
```

**Semaine 2** :
```javascript
const START_DATE = '2021-01-01';
const END_DATE = '2026-01-23';
```

✅ Moins de risque d'erreur  
✅ Peut être fait en plusieurs fois  
⏱️ ~3h par session

### Option 3 : Archivage récent uniquement
```javascript
const START_DATE = '2024-01-01';
const END_DATE = '2026-01-23';
```
✅ Rapide (~1h)  
⚠️ Données anciennes restent en base

---

## 🔒 Sécurité

### Sauvegarde avant archivage
**IMPORTANT** : Le script **supprime définitivement** les données de Supabase !

Avant de lancer, faites une sauvegarde :
1. Aller sur Supabase Dashboard
2. Database → Backups → Create backup
3. Ou exporter la table `lightning_strikes` en CSV

### Annuler une suppression
Si vous avez supprimé par erreur :
1. Restaurer le backup Supabase
2. Supprimer les images PNG créées
3. Relancer le script avec les bonnes dates

---

## 📞 Support

En cas de problème :
1. Vérifier que `npm run dev` tourne
2. Vérifier l'espace disque disponible
3. Consulter les logs du script
4. Réduire `BATCH_SIZE` si instable

---

## ✅ Checklist avant lancement

- [ ] Serveur dev lancé (`npm run dev`)
- [ ] Au moins 3 GB d'espace disque libre
- [ ] Backup Supabase créé (optionnel mais recommandé)
- [ ] Dates START_DATE et END_DATE configurées
- [ ] BATCH_SIZE configuré (10 recommandé)
- [ ] Temps disponible (~5-6h pour archivage complet)

**Prêt ? Lancez : `node scripts/mass-archive-foudre.mjs`**

---

**Créé le** : 24 janvier 2026  
**Auteur** : Antigravity AI
