# Automatisation du Radar de Pluie

Vous avez deux options principales pour automatiser l'enregistrement du radar, selon la source de données souhaitée.

## Option 1 : Radar Météo-France (Haute Précision) - Recommandé
Le script actuel utilise Python pour traiter les données brutes complexes de Météo-France. **Ces scripts ne peuvent pas tourner directement sur Supabase** (qui utilise du JavaScript/Deno léger).

**Solution : GitHub Actions (Gratuit et Invisible)**
C'est la méthode décrite dans `SETUP_RADAR_MF.md`.
1. Le code est stocké sur GitHub.
2. Une "Action" (Cron) se lance toutes les 5 minutes.
3. Elle exécute le script Python.
4. Le script envoie les images dans votre Supabase Storage.

**Avantages :** Qualité Météo-France officielle, gratuit.
**Inconvénients :** Nécessite de configurer les "Secrets" sur GitHub (Clé Supabase).

---

## Option 2 : Radar RainViewer (Plus simple, via Supabase)
Si vous voulez absolument utiliser **uniquement Supabase**, nous pouvons utiliser la fonction existante `supabase/functions/archive-radar`.

**Restrictions :**
- Elle utilise l'API **RainViewer** (mondial) et non Météo-France direct.
- Moins précis pour la France que le radar MF dédié.

**Mise en place :**
1. Déployer la fonction sur Supabase : `npx supabase functions deploy archive-radar`
2. Activer l'extension `pg_cron` dans Supabase (Dashboard -> Database -> Extensions).
3. Créer une tâche Cron SQL dans Supabase (SQL Editor) :
   ```sql
   select cron.schedule(
     'radar-refresh-10min',
     '*/10 * * * *', -- Toutes les 10 minutes
     $$
     select
       net.http_post(
           url:='https://votre-projet.supabase.co/functions/v1/archive-radar',
           headers:='{"Content-Type": "application/json", "Authorization": "Bearer VOTRE_CLE_SERVICE_ROLE"}'::jsonb
       ) as request_id;
     $$
   );
   ```

## Conclusion
- Si vous voulez les images **Météo-France** (comme on a fait avec le script Python) : Utilisez **GitHub Actions**.
- Si vous voulez tout gérer dans **Supabase** : Utilisez l'option RainViewer, mais ce ne sera pas les mêmes données.

**Je peux vous aider à configurer l'une ou l'autre. Laquelle préférez-vous ?**
