# 🚀 ACTIVATION DU SYSTÈME AUTOMATIQUE - GUIDE RAPIDE

## Étape 1 : Connectez-vous à Supabase

Ouvrez ce lien dans votre navigateur :
👉 https://supabase.com/dashboard/project/ubdevaemtwbzxksjlhjg/sql/new

## Étape 2 : Copiez et exécutez ce code SQL

```sql
-- ============================================
-- ACTIVATION COLLECTE AUTOMATIQUE MÉTÉO
-- ============================================

-- 1. Activer les extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- 2. Collecte 6 minutes (toutes les 6 minutes)
SELECT cron.schedule(
  'collect-meteo-6mn',
  '*/6 * * * *',
  $$
  SELECT extensions.http_post(
    url := 'https://ubdevaemtwbzxksjlhjg.supabase.co/functions/v1/collect-6mn',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- 3. Collecte horaire (toutes les heures à H:05)
SELECT cron.schedule(
  'collect-meteo-horaire',
  '5 * * * *',
  $$
  SELECT extensions.http_post(
    url := 'https://ubdevaemtwbzxksjlhjg.supabase.co/functions/v1/collect-horaire',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- 4. Vérifier que c'est activé
SELECT jobid, schedule, command, active
FROM cron.job
WHERE jobname IN ('collect-meteo-6mn', 'collect-meteo-horaire');
```

## Étape 3 : Cliquez sur "RUN"

Vous devriez voir un message de succès.

## ✅ C'est tout !

À partir de maintenant :
- ✅ Les données seront collectées automatiquement toutes les 6 minutes
- ✅ Plus jamais de retard
- ✅ Votre site sera toujours à jour

## 🔍 Pour vérifier que ça fonctionne

Attendez 6-7 minutes, puis exécutez :

```sql
SELECT MAX(timestamp) as derniere_collecte, COUNT(*) as total
FROM observations_6mn;
```

Vous devriez voir une date très récente !

---

**IMPORTANT** : Avant que les cron jobs fonctionnent, vous devez d'abord déployer les Edge Functions.
Ouvrez un terminal et exécutez :

```bash
# 1. Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# 2. Se connecter
supabase login

# 3. Lier le projet
supabase link --project-ref ubdevaemtwbzxksjlhjg

# 4. Déployer les fonctions
supabase functions deploy collect-6mn
supabase functions deploy collect-horaire
```

Ensuite, exécutez le SQL ci-dessus !
