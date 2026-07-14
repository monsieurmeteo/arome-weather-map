# Guide de Déploiement des Edge Functions Supabase

## 📋 Prérequis

1. Installer Supabase CLI :
```bash
npm install -g supabase
```

2. Se connecter à votre projet Supabase :
```bash
supabase login
supabase link --project-ref ubdevaemtwbzxksjlhjg
```

## 🚀 Déploiement des Functions

### 1. Déployer la fonction de collecte 6 minutes
```bash
supabase functions deploy collect-6mn
```

### 2. Déployer la fonction de collecte horaire
```bash
supabase functions deploy collect-horaire
```

## ⏰ Configuration des Cron Jobs

Connectez-vous à votre dashboard Supabase : https://supabase.com/dashboard/project/ubdevaemtwbzxksjlhjg

### Pour la collecte 6 minutes :
1. Allez dans **Database** → **Cron Jobs** (ou utilisez l'extension pg_cron)
2. Créez un nouveau cron job :

```sql
-- Exécuter toutes les 6 minutes
SELECT cron.schedule(
  'collect-meteo-6mn',
  '*/6 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ubdevaemtwbzxksjlhjg.supabase.co/functions/v1/collect-6mn',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
  );
  $$
);
```

### Pour la collecte horaire :
```sql
-- Exécuter toutes les heures à la 5ème minute
SELECT cron.schedule(
  'collect-meteo-horaire',
  '5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ubdevaemtwbzxksjlhjg.supabase.co/functions/v1/collect-horaire',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
  );
  $$
);
```

## 🔍 Vérification

### Lister les cron jobs actifs :
```sql
SELECT * FROM cron.job;
```

### Voir l'historique d'exécution :
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### Tester manuellement une fonction :
```bash
# Test collect-6mn
curl -X POST https://ubdevaemtwbzxksjlhjg.supabase.co/functions/v1/collect-6mn \
  -H "Authorization: Bearer VOTRE_SERVICE_ROLE_KEY"

# Test collect-horaire
curl -X POST https://ubdevaemtwbzxksjlhjg.supabase.co/functions/v1/collect-horaire \
  -H "Authorization: Bearer VOTRE_SERVICE_ROLE_KEY"
```

## 🛠️ Alternative : Configuration via SQL directe

Si vous préférez configurer via SQL, exécutez ces commandes dans l'éditeur SQL de Supabase :

```sql
-- 1. Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- 2. Créer les cron jobs
SELECT cron.schedule(
  'collect-meteo-6mn',
  '*/6 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ubdevaemtwbzxksjlhjg.supabase.co/functions/v1/collect-6mn',
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
  $$
);

SELECT cron.schedule(
  'collect-meteo-horaire',
  '5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ubdevaemtwbzxksjlhjg.supabase.co/functions/v1/collect-horaire',
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
  $$
);
```

## 📊 Monitoring

Pour surveiller l'activité des fonctions :

1. **Logs en temps réel** :
   - Dashboard Supabase → Edge Functions → Logs

2. **Vérifier les données** :
```sql
-- Dernières données 6mn
SELECT COUNT(*), MAX(timestamp) 
FROM observations_6mn;

-- Dernières données horaires
SELECT COUNT(*), MAX(timestamp) 
FROM observations_horaire;
```

## ⚠️ Dépannage

Si les cron jobs ne fonctionnent pas :

1. Vérifiez que les extensions sont activées :
```sql
SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'http');
```

2. Vérifiez les erreurs dans les logs :
```sql
SELECT * FROM cron.job_run_details 
WHERE status = 'failed' 
ORDER BY start_time DESC;
```

3. Supprimez et recréez un cron job si nécessaire :
```sql
SELECT cron.unschedule('collect-meteo-6mn');
-- Puis recréez-le
```

## 🎯 Résultat attendu

Une fois configuré :
- ✅ Les données 6mn seront collectées automatiquement toutes les 6 minutes
- ✅ Les données horaires seront collectées toutes les heures
- ✅ Votre site affichera toujours les données les plus récentes
- ✅ Aucune intervention manuelle nécessaire
