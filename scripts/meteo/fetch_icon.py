"""
Telecharge les donnees ICON-EU depuis le serveur open data DWD (Allemagne).
Resolution : 6.5 km sur l'Europe. Gratuit, sans inscription.
"""
import os
import sys
import bz2
import logging
import requests
from pathlib import Path
from datetime import datetime, timezone, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

from config import MODELS, PARAMETERS, ACTIVE_PARAMETERS

logging.basicConfig(level=logging.INFO, format='%(asctime)s [ICON-EU] %(message)s')
log = logging.getLogger('icon')

OUTPUT_DIR = Path('data/icon-eu')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

DWD_BASE = 'https://opendata.dwd.de/weather/nwp/icon-eu/grib'

ICON_PARAM_MAP = {
    'T_2M':     'single-level',
    'U_10M':    'single-level',
    'V_10M':    'single-level',
    'VMAX_10M': 'single-level',
    'TOT_PREC': 'single-level',
    'PMSL':     'single-level',
    'CLCT':     'single-level',
    'CAPE_CON': 'single-level',
    'RELHUM_2M':'single-level',
    'H_SNOW':   'single-level',
    'FI':       'pressure-level',
}


def build_icon_url(run_date, run_hour, param, step):
    folder = param.lower().replace('_', '_')
    filename = (
        f"icon-eu_europe_regular-lat-lon_single-level_"
        f"{run_date}{run_hour:02d}_{step:03d}_{param}.grib2.bz2"
    )
    return f"{DWD_BASE}/{run_hour:02d}/{folder}/{filename}"


def download_one(url, output_path):
    if output_path.exists():
        return True
    try:
        r = requests.get(url, timeout=60)
        if r.status_code == 404:
            return False
        r.raise_for_status()
        with output_path.open('wb') as f:
            f.write(bz2.decompress(r.content))
        return True
    except Exception as e:
        log.debug(f"Echec {url}: {e}")
        return False


def fetch_icon(run_hour=None):
    """Telecharge toutes les donnees ICON-EU pour un run."""
    model_cfg = MODELS['icon-eu']
    steps = model_cfg['steps']
    now = datetime.now(timezone.utc)

    if run_hour is None:
        available = [h for h in model_cfg['runs'] if (now.hour - 3) % 24 >= h]
        run_hour = max(available) if available else 0

    run_date = now.strftime('%Y%m%d')
    if run_hour > now.hour:
        run_date = (now - timedelta(days=1)).strftime('%Y%m%d')

    log.info(f"Run ICON-EU : {run_date} {run_hour:02d}h UTC - {len(steps)} steps")

    run_dir = OUTPUT_DIR / f'{run_date}_{run_hour:02d}h'
    run_dir.mkdir(parents=True, exist_ok=True)

    # Params actifs
    icon_params = []
    for pk in ACTIVE_PARAMETERS:
        p  = PARAMETERS.get(pk, {})
        ip = p.get('icon_param')
        if ip:
            if isinstance(ip, list):
                icon_params.extend(ip)
            else:
                icon_params.append(ip)
    icon_params = [p for p in dict.fromkeys(icon_params) if p in ICON_PARAM_MAP]

    log.info(f"Params : {icon_params}")

    tasks = []
    for param in icon_params:
        for step in steps:
            url  = build_icon_url(run_date, run_hour, param, step)
            dest = run_dir / f'{param}_{step:03d}.grib2'
            tasks.append((url, dest))

    log.info(f"Fichiers a telecharger : {len(tasks)}")
    ok = 0
    with ThreadPoolExecutor(max_workers=20) as ex:
        futures = {ex.submit(download_one, u, p): (u, p) for u, p in tasks}
        for fut in as_completed(futures):
            if fut.result():
                ok += 1

    log.info(f"OK {ok}/{len(tasks)} fichiers dans {run_dir}")
    return str(run_dir), run_date, run_hour


if __name__ == '__main__':
    run_hour = int(sys.argv[1]) if len(sys.argv) > 1 else None
    run_dir, run_date, run_hour = fetch_icon(run_hour)
    print(f"OUTPUT:{run_dir}:{run_date}:{run_hour}")
