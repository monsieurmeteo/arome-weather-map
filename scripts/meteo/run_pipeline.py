"""
Orchestrateur principal du pipeline météo.
Lance fetch + generation + upload + cleanup pour chaque modèle actif.
Usage : python run_pipeline.py [ecmwf|icon-eu|all]
"""
import sys
import os
import time
import logging
from datetime import datetime, timezone
from pathlib import Path

# ── Chargement du .env local (credentials Supabase) ───────────────────────────
_env_file = Path(__file__).parent / '.env'
if _env_file.exists():
    for _line in _env_file.read_text(encoding='utf-8').splitlines():
        _line = _line.strip()
        if _line and not _line.startswith('#') and '=' in _line:
            _k, _v = _line.split('=', 1)
            os.environ.setdefault(_k.strip(), _v.strip())

from config import MODELS, ACTIVE_PARAMETERS, ACTIVE_ZONES

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [PIPELINE] %(levelname)s %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('pipeline.log', encoding='utf-8'),
    ]
)
log = logging.getLogger('pipeline')


def run_ecmwf():
    from fetch_ecmwf   import fetch_ecmwf
    from generate_maps import process_ecmwf
    from upload_supabase import upload_model_run, update_metadata

    log.info("=" * 60)
    log.info("DÉMARRAGE ECMWF")
    t0 = time.time()

    grib_file, run_date, run_hour = fetch_ecmwf()
    process_ecmwf(grib_file, run_date, run_hour)
    upload_model_run('ecmwf', run_date, run_hour)
    
    if not os.environ.get('SKIP_METADATA'):
        update_metadata('ecmwf', run_date, run_hour, MODELS['ecmwf']['steps'])
    else:
        log.info("SKIP_METADATA est actif : mise à jour de metadata.json ignorée pour ce job")

    log.info(f"✅ ECMWF terminé en {(time.time()-t0)/60:.1f} min")


def run_icon():
    from fetch_icon    import fetch_icon
    from generate_maps import process_icon
    from upload_supabase import upload_model_run, update_metadata

    log.info("=" * 60)
    log.info("DÉMARRAGE ICON-EU")
    t0 = time.time()

    run_dir, run_date, run_hour = fetch_icon()
    process_icon(run_dir, run_date, run_hour)
    upload_model_run('icon-eu', run_date, run_hour)
    
    if not os.environ.get('SKIP_METADATA'):
        update_metadata('icon-eu', run_date, run_hour, MODELS['icon-eu']['steps'])
    else:
        log.info("SKIP_METADATA est actif : mise à jour de metadata.json ignorée pour ce job")

    log.info(f"OK ICON-EU termine en {(time.time()-t0)/60:.1f} min")


def run_arome():
    from fetch_arome    import fetch_arome
    from generate_maps import process_arome
    from upload_supabase import upload_model_run, update_metadata

    log.info("=" * 60)
    log.info("DEMARRAGE AROME")
    t0 = time.time()

    run_dir, run_date, run_hour = fetch_arome()
    nb = process_arome(run_dir, run_date, run_hour)
    log.info(f"AROME : {nb} cartes generees")
    upload_model_run('arome', run_date, run_hour)
    
    if not os.environ.get('SKIP_METADATA'):
        update_metadata('arome', run_date, run_hour, MODELS['arome']['steps'])
    else:
        log.info("SKIP_METADATA est actif : mise à jour de metadata.json ignorée pour ce job")

    log.info(f"OK AROME termine en {(time.time()-t0)/60:.1f} min")



def run_cleanup():
    from cleanup_supabase import cleanup_old_files
    log.info("=" * 60)
    log.info("NETTOYAGE SUPABASE (>48h)")
    deleted = cleanup_old_files()
    log.info(f"✅ {deleted} fichiers supprimés")


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else 'all'
    log.info(f"Pipeline démarré — {datetime.now(timezone.utc).isoformat()} UTC")
    log.info(f"Zones actives : {ACTIVE_ZONES}")
    log.info(f"Paramètres actifs : {ACTIVE_PARAMETERS}")

    errors = []

    if target in ('ecmwf', 'all') and MODELS['ecmwf']['enabled']:
        try:
            run_ecmwf()
        except Exception as e:
            log.error(f"❌ ECMWF échoué : {e}")
            errors.append(f"ecmwf: {e}")

    if target in ('arome', 'all') and MODELS['arome']['enabled']:
        try:
            run_arome()
        except Exception as e:
            log.error(f"AROME echoue : {e}")
            errors.append(f"arome: {e}")

    if target in ('icon-eu', 'icon', 'all') and MODELS['icon-eu']['enabled']:
        try:
            run_icon()
        except Exception as e:
            log.error(f"ICON-EU echoue : {e}")
            errors.append(f"icon-eu: {e}")

    # Nettoyage systématique après chaque run
    try:
        run_cleanup()
    except Exception as e:
        log.error(f"❌ Cleanup échoué : {e}")

    if errors:
        log.error(f"Pipeline terminé avec erreurs : {errors}")
        sys.exit(1)
    else:
        log.info("✅ Pipeline complet terminé avec succès")


if __name__ == '__main__':
    main()
