"""
Telecharge les donnees ECMWF Open Data (gratuit, CC-4.0).
Necessite un compte gratuit sur https://api.ecmwf.int
Variables d'env : ECMWF_API_KEY, ECMWF_API_EMAIL
"""
import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta

try:
    from ecmwf.opendata import Client
except ImportError:
    print("ERROR: pip install ecmwf-opendata")
    sys.exit(1)

from config import MODELS, PARAMETERS, ACTIVE_PARAMETERS

# Configure credentials ECMWF depuis variables d'environnement
ECMWF_KEY   = os.environ.get('ECMWF_API_KEY', '')
ECMWF_EMAIL = os.environ.get('ECMWF_API_EMAIL', '')

if ECMWF_KEY and ECMWF_EMAIL:
    rc_path = Path.home() / '.ecmwfapirc'
    rc_content = json.dumps({
        "url": "https://api.ecmwf.int/v1",
        "key": ECMWF_KEY,
        "email": ECMWF_EMAIL
    }, indent=2)
    rc_path.write_text(rc_content)
    logging.getLogger('ecmwf').info(f"Credentials ECMWF configures pour {ECMWF_EMAIL}")

logging.basicConfig(level=logging.INFO, format='%(asctime)s [ECMWF] %(message)s')
log = logging.getLogger('ecmwf')

OUTPUT_DIR = Path('data/ecmwf')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Collecte tous les params ECMWF actifs
ECMWF_PARAMS = []
ECMWF_LEVEL_PARAMS = {}  # params sur niveaux de pression

for pk in ACTIVE_PARAMETERS:
    p  = PARAMETERS.get(pk, {})
    ep = p.get('ecmwf_param')
    if not ep:
        continue
    if p.get('ecmwf_levtype') == 'pl':
        lvl = p.get('ecmwf_level', 500)
        ECMWF_LEVEL_PARAMS.setdefault(lvl, [])
        if isinstance(ep, list):
            ECMWF_LEVEL_PARAMS[lvl].extend(ep)
        else:
            ECMWF_LEVEL_PARAMS[lvl].append(ep)
    else:
        if isinstance(ep, list):
            ECMWF_PARAMS.extend(ep)
        else:
            ECMWF_PARAMS.append(ep)

ECMWF_PARAMS = list(dict.fromkeys(ECMWF_PARAMS))


def fetch_ecmwf(run_hour=None):
    """Telecharge le dernier run ECMWF disponible."""
    client = Client(source='ecmwf')
    model_cfg = MODELS['ecmwf']
    steps = model_cfg['steps']

    now = datetime.now(timezone.utc)
    run_date = now.strftime('%Y%m%d')

    if run_hour is None:
        hour = now.hour
        if hour >= 18:
            run_hour = 12
        elif hour >= 6:
            run_hour = 0
        else:
            now -= timedelta(days=1)
            run_date = now.strftime('%Y%m%d')
            run_hour = 12

    output_file = OUTPUT_DIR / f'ecmwf_{run_date}_{run_hour:02d}h.grib2'

    if output_file.exists():
        log.info(f"Deja present : {output_file}")
        return str(output_file), run_date, run_hour

    log.info(f"Telechargement ECMWF run {run_date} {run_hour:02d}h UTC - {len(steps)} steps")

    try:
        # Parametres surface
        if ECMWF_PARAMS:
            client.retrieve(
                date=f"{run_date[:4]}-{run_date[4:6]}-{run_date[6:8]}",
                time=run_hour,
                step=steps,
                type='fc',
                param=ECMWF_PARAMS,
                target=str(output_file),
            )

        # Parametres sur niveaux de pression (ex: geopotentiel 500hPa)
        for lvl, params in ECMWF_LEVEL_PARAMS.items():
            params = list(dict.fromkeys(params))
            lvl_file = OUTPUT_DIR / f'ecmwf_{run_date}_{run_hour:02d}h_pl{lvl}.grib2'
            if not lvl_file.exists():
                client.retrieve(
                    date=f"{run_date[:4]}-{run_date[4:6]}-{run_date[6:8]}",
                    time=run_hour,
                    step=steps,
                    type='fc',
                    levtype='pl',
                    levelist=[lvl],
                    param=params,
                    target=str(lvl_file),
                )
                log.info(f"Niveaux pression {lvl}hPa OK : {lvl_file}")

        size_mb = output_file.stat().st_size / 1e6 if output_file.exists() else 0
        log.info(f"OK : {output_file} ({size_mb:.1f} MB)")
        return str(output_file), run_date, run_hour

    except Exception as e:
        log.error(f"Erreur ECMWF : {e}")
        raise


if __name__ == '__main__':
    run_hour = int(sys.argv[1]) if len(sys.argv) > 1 else None
    grib_file, run_date, run_hour = fetch_ecmwf(run_hour)
    print(f"OUTPUT:{grib_file}:{run_date}:{run_hour}")
