-- Index pour accélérer les requêtes par date et l'archivage
CREATE INDEX IF NOT EXISTS idx_observations_6mn_timestamp ON observations_6mn (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_observations_6mn_station_timestamp ON observations_6mn (station_id, timestamp DESC);
