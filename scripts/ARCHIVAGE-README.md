# Système d'Archivage Automatique des Impacts de Foudre ⚡

## Vue d'ensemble

Ce système automatise la création d'images d'archive quotidiennes des impacts de foudre et le nettoyage de la base de données Supabase.

## Fonctionnement

### 1. **Collecte des données** (Continu)
- Script : `force_foudre_collect.mjs`
- Fréquence : Toutes les heures (via cron Supabase ou serveur)
- Source : API Agate
- Destination : Table `lightning_strikes` dans Supabase

### 2. **Archivage quotidien** (Automatique)
- Script : `auto-archive.js`
- Déclenchement : Chaque jour à 02h00 (heure locale)
- Actions :
  1. Lance un navigateur headless (Puppeteer)
  2. Ouvre `/foudre?date=HIER&automated=true&forcePoints=true`
  3. Attend le chargement complet des impacts
  4. Capture une image PNG haute résolution
  5. Sauvegarde dans `/public/archives-foudre/bilan-foudre-YYYY-MM-DD.png`
  6. **Supprime les impacts de la veille depuis Supabase** (libération d'espace)

### 3. **Affichage optimisé**
- Si une image d'archive existe → Affichage instantané (rapide)
- Sinon → Chargement depuis Supabase (lent mais complet)

## Configuration

### Prérequis
```bash
npm install puppeteer @supabase/supabase-js
```

### Variables d'environnement
Fichier `.env.local` :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon
```

### Cron Job (Recommandé)
Ajouter dans le crontab du serveur :
```cron
# Archivage quotidien à 02h00
0 2 * * * cd /chemin/vers/minisite-douai && node scripts/auto-archive.js >> logs/archive.log 2>&1
```

Ou via Supabase Edge Functions (si hébergé sur Vercel/Netlify) :
```sql
-- Créer une fonction cron dans Supabase
SELECT cron.schedule(
  'archive-foudre-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://votre-site.vercel.app/api/archive-foudre',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
```

## Corrections appliquées (24/01/2026)

### ✅ **Problème 1 : Récupération 24h incorrecte**
**Avant** :
```javascript
const startUTC = dateStart.toISOString().split('T')[0] + 'T18:00:00Z';
const endUTC = dateEnd.toISOString().split('T')[0] + 'T06:00:00Z';
```
❌ Récupérait de J-1 18h UTC à J+1 06h UTC (données manquantes/en trop)

**Après** :
```javascript
const startLocal = new Date(`${dayString}T00:00:00`);
const endLocal = new Date(`${dayString}T23:59:59`);
const startUTC = new Date(startLocal.getTime() - (startLocal.getTimezoneOffset() * 60000)).toISOString();
const endUTC = new Date(endLocal.getTime() - (endLocal.getTimezoneOffset() * 60000)).toISOString();
```
✅ Récupère EXACTEMENT de 00h00 à 23h59 heure locale (Europe/Paris)

### ✅ **Problème 2 : Suppression incorrecte dans Supabase**
**Avant** :
```javascript
const startUTC = new Date(`${dateStr}T00:00:00`).toISOString();
const endUTC = new Date(`${dateStr}T23:59:59`).toISOString();
```
❌ Supprimait les mauvaises heures (interprétation UTC au lieu de locale)

**Après** :
```javascript
const startLocal = new Date(`${dateStr}T00:00:00`);
const endLocal = new Date(`${dateStr}T23:59:59`);
const startUTC = new Date(startLocal.getTime() - (startLocal.getTimezoneOffset() * 60000)).toISOString();
const endUTC = new Date(endLocal.getTime() - (endLocal.getTimezoneOffset() * 60000)).toISOString();
```
✅ Supprime exactement les impacts de la journée archivée

### ✅ **Problème 3 : Dossier archives manquant**
**Ajouté** :
```javascript
const archiveDir = path.join(__dirname, '../public/archives-foudre');
if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
}
```
✅ Création automatique du dossier si nécessaire

## Utilisation manuelle

### Archiver une date spécifique
```bash
# Modifier la date dans auto-archive.js (ligne 26-28)
node scripts/auto-archive.js
```

### Tester sans suppression
Commenter les lignes 65-72 dans `auto-archive.js` :
```javascript
// const { error, count } = await supabase...
```

### Vérifier les archives existantes
```bash
ls -lh public/archives-foudre/
```

## Monitoring

### Logs à surveiller
- ✅ `Image enregistrée : /path/to/bilan-foudre-YYYY-MM-DD.png`
- ✅ `X impacts supprimés de la base de données !`
- ❌ `Échec de l'archivage : ...`
- ❌ `Erreur lors de la suppression : ...`

### Métriques Supabase
Vérifier la taille de la table `lightning_strikes` :
```sql
SELECT 
  pg_size_pretty(pg_total_relation_size('lightning_strikes')) as taille_totale,
  COUNT(*) as nb_impacts,
  MIN(strike_time) as plus_ancien,
  MAX(strike_time) as plus_recent
FROM lightning_strikes;
```

**Attendu** : 
- Taille : ~50-200 MB (1-3 jours de données)
- Nb impacts : 10k-500k selon l'activité orageuse
- Plus ancien : Aujourd'hui - 2 jours maximum

## Dépannage

### L'image n'est pas créée
1. Vérifier que le serveur dev tourne : `npm run dev`
2. Vérifier les logs Puppeteer
3. Augmenter le timeout (ligne 40) : `timeout: 120000`

### Les impacts ne sont pas supprimés
1. Vérifier les droits Supabase (service_role key nécessaire)
2. Vérifier les logs de suppression
3. Tester manuellement :
```javascript
const { count } = await supabase
  .from('lightning_strikes')
  .select('*', { count: 'exact', head: true })
  .gte('strike_time', 'YYYY-MM-DDT00:00:00Z')
  .lte('strike_time', 'YYYY-MM-DDT23:59:59Z');
console.log(`${count} impacts à supprimer`);
```

### Espace disque insuffisant
Les images PNG font ~500 KB - 5 MB chacune.
Pour 365 jours : ~200 MB - 2 GB

**Solution** : Archiver les anciennes images (>1 an) sur un stockage externe ou les compresser.

## Évolutions futures

- [ ] Compression des images (WebP au lieu de PNG)
- [ ] Upload automatique vers un CDN (Cloudflare R2, AWS S3)
- [ ] Génération de vidéos time-lapse mensuelles
- [ ] Statistiques automatiques (nb impacts/jour, régions les plus touchées)
- [ ] Alertes email en cas d'échec d'archivage

## Support

En cas de problème :
1. Vérifier les logs : `tail -f logs/archive.log`
2. Tester manuellement : `node scripts/auto-archive.js`
3. Vérifier Supabase Dashboard → Table Editor → lightning_strikes
