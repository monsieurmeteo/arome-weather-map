-- Migration pour supprimer le trigger de synchronisation en temps réel sur observations_6mn
-- Objectif : Réduire le Disk IO Budget en supprimant les mises à jour répétitives

DROP TRIGGER IF EXISTS trg_sync_daily_summary ON observations_6mn;

-- Note : Nous remplacerons ce trigger par une tâche planifiée (batch) plus tard.