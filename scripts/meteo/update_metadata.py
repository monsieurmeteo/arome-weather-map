"""
Consolide et met à jour metadata.json sur Supabase après la fin de tous les jobs parallèles.
Détecte automatiquement le run le plus récent si la date et l'heure ne sont pas fournies.
Usage : python update_metadata.py [ecmwf|icon-eu|arome] [run_date] [run_hour]
"""
import sys
import logging
from datetime import datetime, timezone, timedelta
from config import MODELS
from upload_supabase import update_metadata

logging.basicConfig(level=logging.INFO, format='%(asctime)s [METADATA_CONSOLIDATOR] %(levelname)s %(message)s')
log = logging.getLogger('metadata_consolidator')

def auto_detect_run(model):
    """Calcule le run le plus récent d'après la date actuelle UTC (comme dans fetch_icon.py / fetch_ecmwf.py)."""
    now = datetime.now(timezone.utc)
    model_cfg = MODELS[model]
    
    if model == 'ecmwf':
        # ECMWF dispo environ 7h après le run (runs à 00h et 12h)
        hour = now.hour
        if hour >= 19:
            run_hour = 12
            run_date = now.strftime('%Y%m%d')
        elif hour >= 7:
            run_hour = 0
            run_date = now.strftime('%Y%m%d')
        else:
            run_hour = 12
            run_date = (now - timedelta(days=1)).strftime('%Y%m%d')
        return run_date, run_hour
        
    elif model == 'icon-eu':
        # ICON-EU dispo environ 3h après le run (runs toutes les 3h)
        available_hours = [h for h in model_cfg['runs'] if (now.hour - 3) % 24 >= h]
        run_hour = max(available_hours) if available_hours else 21
        run_date = now.strftime('%Y%m%d')
        if run_hour > now.hour:
            run_date = (now - timedelta(days=1)).strftime('%Y%m%d')
        return run_date, run_hour
        
    elif model == 'arome':
        # AROME dispo environ 2h après le run (runs toutes les 3h)
        available_hours = [h for h in model_cfg['runs'] if (now.hour - 2) % 24 >= h]
        run_hour = max(available_hours) if available_hours else 21
        run_date = now.strftime('%Y%m%d')
        if run_hour > now.hour:
            run_date = (now - timedelta(days=1)).strftime('%Y%m%d')
        return run_date, run_hour
        
    raise ValueError(f"Détection automatique non prise en charge pour le modèle '{model}'")

def main():
    if len(sys.argv) < 2:
        log.error("Usage: python update_metadata.py [model] [optional: run_date] [optional: run_hour]")
        sys.exit(1)
        
    model = sys.argv[1]
    if model not in MODELS:
        log.error(f"Modèle inconnu : {model}")
        sys.exit(1)
        
    # Détermination de la date et de l'heure
    if len(sys.argv) >= 4:
        run_date = sys.argv[2]
        run_hour = int(sys.argv[3])
    else:
        log.info(f"Détection automatique du dernier run pour {model}...")
        try:
            run_date, run_hour = auto_detect_run(model)
        except Exception as e:
            log.error(f"Impossible de détecter automatiquement le run : {e}")
            sys.exit(1)
            
    steps = MODELS[model]['steps']
    log.info(f"Mise à jour de metadata.json pour {model} ({run_date}_{run_hour:02d}h) avec {len(steps)} échéances...")
    
    try:
        update_metadata(model, run_date, run_hour, steps)
        log.info("✅ Consolidation des métadonnées terminée avec succès")
    except Exception as e:
        log.error(f"❌ Erreur lors de la mise à jour des métadonnées : {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
