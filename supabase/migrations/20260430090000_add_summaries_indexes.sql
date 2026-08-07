-- Migration pour ajouter des index sur daily_summaries
-- Objectif : Accélérer les RPC get_daily_extremes_fast et full

CREATE INDEX IF NOT EXISTS idx_daily_summaries_date ON daily_summaries (date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_station_date ON daily_summaries (station_id, date DESC);

-- Analyse de la table pour mettre à jour les statistiques de planification
ANALYZE daily_summaries;
