-- Migration : Protection automatique de la table observations_6mn
-- Limite à 300 000 lignes max pour 2000+ postes

-- 1. Fonction de comptage rapide (utilise les stats du planificateur, pas COUNT(*))
CREATE OR REPLACE FUNCTION get_observations_count()
RETURNS bigint AS $$
DECLARE
    v_count bigint;
BEGIN
    SELECT reltuples::bigint INTO v_count
    FROM pg_class
    WHERE relname = 'observations_6mn';
    RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fonction de nettoyage intelligent
-- Supprime les lignes excédentaires en gardant les 300 000 plus récentes
CREATE OR REPLACE FUNCTION cleanup_observations_to_limit(max_rows bigint DEFAULT 300000)
RETURNS TABLE(rows_before bigint, rows_deleted bigint, pivot_timestamp timestamptz) AS $$
DECLARE
    v_count bigint;
    v_to_delete bigint;
    v_pivot timestamptz;
BEGIN
    -- Comptage estimé rapide
    SELECT reltuples::bigint INTO v_count
    FROM pg_class WHERE relname = 'observations_6mn';
    
    IF v_count <= max_rows THEN
        RETURN QUERY SELECT v_count, 0::bigint, NULL::timestamptz;
        RETURN;
    END IF;
    
    v_to_delete := v_count - max_rows;
    
    -- Trouver le timestamp pivot
    SELECT timestamp INTO v_pivot
    FROM observations_6mn
    ORDER BY timestamp ASC
    OFFSET v_to_delete LIMIT 1;
    
    IF v_pivot IS NULL THEN
        RETURN QUERY SELECT v_count, 0::bigint, NULL::timestamptz;
        RETURN;
    END IF;
    
    -- Suppression des lignes anciennes
    DELETE FROM observations_6mn WHERE timestamp < v_pivot;
    
    RETURN QUERY SELECT v_count, v_to_delete, v_pivot;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Mettre à jour les permissions RPC (accès depuis l'anon key)
GRANT EXECUTE ON FUNCTION get_observations_count() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION cleanup_observations_to_limit(bigint) TO service_role;

-- 4. Vérification post-migration
SELECT get_observations_count() as estimated_rows;
