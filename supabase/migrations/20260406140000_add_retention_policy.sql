-- ============================================================
-- POLITIQUE DE RÉTENTION DES DONNÉES
-- Objectif : Réduire le Disk IO en supprimant les vieilles
-- données via pg_cron (nettoyage automatique quotidien)
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Nettoyage observations_6mn : garder seulement 30 derniers jours
--    (Les données 6min sont volumineuses : ~20 000 lignes/heure)
-- ----------------------------------------------------------------
SELECT cron.schedule(
  'cleanup-observations-6mn',
  '0 3 * * *',  -- Chaque nuit à 3h UTC
  $$
    DELETE FROM observations_6mn
    WHERE timestamp < NOW() - INTERVAL '30 days';
  $$
);

-- ----------------------------------------------------------------
-- 2. Nettoyage observations_horaire : garder 6 mois
--    (Les données horaires sont moins volumineuses)
-- ----------------------------------------------------------------
SELECT cron.schedule(
  'cleanup-observations-horaire',
  '30 3 * * *',  -- Chaque nuit à 3h30 UTC
  $$
    DELETE FROM observations_horaire
    WHERE timestamp < NOW() - INTERVAL '6 months';
  $$
);

-- ----------------------------------------------------------------
-- 3. Nettoyage observations (table générale si elle existe)
-- ----------------------------------------------------------------
SELECT cron.schedule(
  'cleanup-observations',
  '0 4 * * *',  -- Chaque nuit à 4h UTC
  $$
    DELETE FROM observations
    WHERE date_obs < NOW() - INTERVAL '6 months';
  $$
);

-- ----------------------------------------------------------------
-- 4. VACUUM ANALYZE pour libérer l'espace disque après suppression
--    (sinon PostgreSQL garde l'espace alloué = IO identique)
-- ----------------------------------------------------------------
SELECT cron.schedule(
  'vacuum-observations-6mn',
  '0 4 * * 0',  -- Chaque dimanche à 4h UTC
  $$
    VACUUM ANALYZE observations_6mn;
  $$
);

-- ----------------------------------------------------------------
-- Vérifier les jobs créés
-- ----------------------------------------------------------------
-- SELECT * FROM cron.job;
