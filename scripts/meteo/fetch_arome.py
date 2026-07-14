"""
Telecharge les donnees AROME depuis l'API Meteo-France (WCS).
Resolution : 1.3 km sur la France. Runs toutes les 3h.
Necessite : MF_API_TOKEN (portail-api.meteofrance.fr)
Rate limit : 50 req/min → on limite a 40/min (1.5s entre requetes)
"""
import os
import sys
import time
import logging
import requests
from pathlib import Path
from datetime import datetime, timezone, timedelta

from config import MODELS, PARAMETERS, ACTIVE_PARAMETERS

logging.basicConfig(level=logging.INFO, format='%(asctime)s [AROME] %(message)s')
log = logging.getLogger('arome')

OUTPUT_DIR = Path('data/arome')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

MF_TOKEN = os.environ.get('MF_API_TOKEN', '')
# URL correcte : sans "1.0/" (confirme par GetCapabilities reel)
WCS_BASE = 'https://public-api.meteofrance.fr/public/arome/wcs/MF-NWP-HIGHRES-AROME-001-FRANCE-WCS'

# Delai entre requetes pour respecter le quota 50/min
REQUEST_DELAY = 1.6  # secondes → ~37 req/min, sous la limite de 50


def _headers():
    """Headers d'authentification MF API (apikey = methode valide, 200 OK confirme)."""
    return {'apikey': MF_TOKEN}

# Mapping parametres → WCS coverage ID + height
# IDs verifies depuis GetCapabilities reel (6600 coverages disponibles)
AROME_COVERAGE = {
    'temperature': {
        'coverage': 'TEMPERATURE__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
        'height': 2,
    },
    'wind_speed': [
        {'coverage': 'U_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND', 'height': 10, 'component': 'U'},
        {'coverage': 'V_COMPONENT_OF_WIND__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND', 'height': 10, 'component': 'V'},
    ],
    'wind_gusts': {
        'coverage': 'WIND_SPEED_GUST__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
        'height': 10,
    },
    'precipitation': {
        'coverage': 'TOTAL_PRECIPITATION__GROUND_OR_WATER_SURFACE',
        'height': None,
    },
    'pressure': {
        'coverage': 'PRESSURE__MEAN_SEA_LEVEL',
        'height': None,
    },
    'clouds': {
        'coverage': 'TOTAL_CLOUD_COVER__GROUND_OR_WATER_SURFACE',
        'height': None,
    },
    'humidity': {
        'coverage': 'RELATIVE_HUMIDITY__SPECIFIC_HEIGHT_LEVEL_ABOVE_GROUND',
        'height': 2,
    },
    'cape': {
        'coverage': 'CONVECTIVE_AVAILABLE_POTENTIAL_ENERGY__GROUND_OR_WATER_SURFACE',
        'height': None,
    },
    'snow': {
        'coverage': 'SNOW_DEPTH__GROUND_OR_WATER_SURFACE',
        'height': None,
    },
}


def get_run_time(run_hour):
    """Retourne la date/heure du run au format ISO 8601 pour l'API."""
    now = datetime.now(timezone.utc)
    run_date = now.strftime('%Y%m%d')
    if run_hour > now.hour:
        run_date = (now - timedelta(days=1)).strftime('%Y%m%d')
    dt = datetime(int(run_date[:4]), int(run_date[4:6]), int(run_date[6:8]),
                  run_hour, 0, 0, tzinfo=timezone.utc)
    return dt, run_date


def valid_time_iso(run_dt, step):
    """Heure valide pour une echeance donnee."""
    vt = run_dt + timedelta(hours=step)
    return vt.strftime('%Y-%m-%dT%H:%M:%SZ')


def run_iso(run_dt):
    """Format ISO du run pour le coverage ID."""
    return run_dt.strftime('%Y-%m-%dT%H.%M.%SZ')


def download_coverage(coverage_id, step, run_dt, height, output_path):
    """Telecharge un champ GRIB2 depuis l'API WCS Meteo-France."""
    if output_path.exists():
        return True

    params = {
        'SERVICE': 'WCS',
        'VERSION': '2.0.1',
        'REQUEST': 'GetCoverage',
        'format': 'application/wmo-grib2',
        'coverageId': f'{coverage_id}___{run_iso(run_dt)}',
        'SUBSET': [
            f'time({valid_time_iso(run_dt, step)})',
            'lat(41.0,52.5)',
            'long(-6.0,11.0)',
        ],
    }
    if height is not None:
        params['SUBSET'].append(f'height({height})')

    headers = {'apikey': MF_TOKEN}
    url = f'{WCS_BASE}/GetCoverage'

    try:
        r = requests.get(url, params=params, headers=headers, timeout=60, stream=True)
        if r.status_code == 200:
            with output_path.open('wb') as f:
                for chunk in r.iter_content(chunk_size=65536):
                    f.write(chunk)
            return True
        elif r.status_code == 404:
            log.debug(f"Non dispo: {coverage_id} H+{step:03d}")
            return False
        else:
            log.warning(f"HTTP {r.status_code} pour {coverage_id} H+{step:03d}: {r.text[:120]}")
            return False
    except Exception as e:
        log.warning(f"Erreur {coverage_id} H+{step:03d}: {e}")
        return False


def fetch_arome(run_hour=None):
    """Telecharge toutes les donnees AROME pour un run (sequentiel, rate-limited)."""
    if not MF_TOKEN:
        raise ValueError("MF_API_TOKEN manquant")

    model_cfg = MODELS['arome']
    steps = model_cfg['steps']

    now = datetime.now(timezone.utc)
    if run_hour is None:
        available = [h for h in model_cfg['runs'] if (now.hour - 2) % 24 >= h]
        run_hour = max(available) if available else 0

    run_dt, run_date = get_run_time(run_hour)
    log.info(f"Run AROME : {run_date} {run_hour:02d}h UTC - {len(steps)} steps")

    run_dir = OUTPUT_DIR / f'{run_date}_{run_hour:02d}h'
    run_dir.mkdir(parents=True, exist_ok=True)

    # Prepare taches de telechargement
    tasks = []
    for param_key in ACTIVE_PARAMETERS:
        cov = AROME_COVERAGE.get(param_key)
        if not cov:
            continue
        if isinstance(cov, list):
            for sub in cov:
                for step in steps:
                    fname = f'{param_key}_{sub["component"]}_{step:03d}.grib2'
                    tasks.append((sub['coverage'], step, run_dt,
                                  sub.get('height'), run_dir / fname))
        else:
            for step in steps:
                fname = f'{param_key}_{step:03d}.grib2'
                tasks.append((cov['coverage'], step, run_dt,
                               cov.get('height'), run_dir / fname))

    total = len(tasks)
    log.info(f"Fichiers a telecharger : {total} (sequentiel, {REQUEST_DELAY}s entre chaque)")
    ok = skipped = errors = 0

    for i, (coverage_id, step, rdt, height, out_path) in enumerate(tasks):
        # Skip si deja present
        if out_path.exists():
            skipped += 1
            continue

        # Construire et envoyer la requete
        params = {
            'SERVICE': 'WCS', 'VERSION': '2.0.1', 'REQUEST': 'GetCoverage',
            'format': 'application/wmo-grib2',
            'coverageId': f'{coverage_id}___{run_iso(rdt)}',
            'SUBSET': [
                f'time({valid_time_iso(rdt, step)})',
                'lat(41.0,52.5)', 'long(-6.0,11.0)',
            ],
        }
        if height is not None:
            params['SUBSET'].append(f'height({height})')

        headers = _headers()

        # Retry sur 429
        for attempt in range(3):
            try:
                r = requests.get(f'{WCS_BASE}/GetCoverage', params=params,
                                 headers=headers, timeout=90, stream=True)
                if r.status_code == 200:
                    with out_path.open('wb') as f:
                        for chunk in r.iter_content(chunk_size=65536):
                            f.write(chunk)
                    ok += 1
                    break
                elif r.status_code == 429:
                    wait = 60 + attempt * 30
                    log.warning(f"429 quota depasse - attente {wait}s...")
                    time.sleep(wait)
                elif r.status_code == 404:
                    log.debug(f"Non dispo H+{step:03d} {coverage_id[:40]}")
                    break
                else:
                    log.warning(f"HTTP {r.status_code} H+{step:03d}: {r.text[:80]}")
                    errors += 1
                    break
            except Exception as e:
                log.warning(f"Erreur H+{step:03d}: {e}")
                errors += 1
                break

        # Log progres tous les 50 fichiers
        if (i + 1) % 50 == 0:
            log.info(f"  Progres: {i+1}/{total} | OK={ok} Sautes={skipped} Erreurs={errors}")

        # Rate limiting : pause entre chaque requete
        time.sleep(REQUEST_DELAY)

    log.info(f"AROME OK: {ok}/{total-skipped} telecharges ({skipped} deja presents, {errors} erreurs)")
    return str(run_dir), run_date, run_hour


if __name__ == '__main__':
    run_hour = int(sys.argv[1]) if len(sys.argv) > 1 else None
    run_dir, run_date, run_hour = fetch_arome(run_hour)
    print(f"OUTPUT:{run_dir}:{run_date}:{run_hour}")

