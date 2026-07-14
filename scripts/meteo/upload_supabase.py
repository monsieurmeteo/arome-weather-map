"""
Upload les PNG generes vers Supabase Storage via HTTP direct.
Contourne le bug supabase-py avec les nouvelles cles sb_secret_.
Upload parallèle avec ThreadPoolExecutor pour éviter les timeouts.
"""
import os
import sys
import json
import logging
import requests
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# ── Chargement du .env local (credentials Supabase) ───────────────────────────
_env_file = Path(__file__).parent / '.env'
if _env_file.exists():
    for _line in _env_file.read_text(encoding='utf-8').splitlines():
        _line = _line.strip()
        if _line and not _line.startswith('#') and '=' in _line:
            _k, _v = _line.split('=', 1)
            os.environ.setdefault(_k.strip(), _v.strip())
from datetime import datetime, timezone

from config import (
    BUCKET_NAME, SUPABASE_URL, SUPABASE_KEY,
    storage_path, ACTIVE_ZONES, ACTIVE_PARAMETERS
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s [UPLOAD] %(message)s')
log = logging.getLogger('upload')

OUTPUT_DIR = Path('data/output')

STORAGE_BASE = f"{SUPABASE_URL}/storage/v1"

# Nombre de threads parallèles pour l'upload (adapté au débit réseau)
MAX_WORKERS = 8


def _headers():
    return {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
    }


def upload_file(local_path, remote_path):
    """Upload un fichier PNG via requete HTTP directe avec retries et timeout géré."""
    url = f"{STORAGE_BASE}/object/{BUCKET_NAME}/{remote_path}"
    with open(local_path, 'rb') as f:
        data = f.read()
    h = {**_headers(), 'Content-Type': 'image/png', 'x-upsert': 'true'}

    max_retries = 4
    for attempt in range(1, max_retries + 1):
        try:
            # Essai POST
            r = requests.post(url, headers=h, data=data, timeout=30)
            if r.status_code in (200, 201):
                return True

            # Essai PUT si le POST échoue (fichier existant)
            r2 = requests.put(url, headers=h, data=data, timeout=30)
            if r2.status_code in (200, 201, 204):
                return True

            log.warning(f"Tentative {attempt}/{max_retries} échouée pour {remote_path} "
                        f"(POST: {r.status_code}, PUT: {r2.status_code})")
        except requests.RequestException as e:
            log.warning(f"Tentative {attempt}/{max_retries} réseau pour {remote_path}: {e}")

        # Délai exponentiel avant retry
        if attempt < max_retries:
            time.sleep(min(2 ** attempt, 10))

    log.error(f"❌ Échec définitif pour {remote_path} après {max_retries} tentatives")
    return False


def _collect_files(model, run_date, run_hour):
    """Collecte tous les fichiers (local_path, remote_path) à uploader."""
    run_dir = OUTPUT_DIR / model
    files = []

    for zone_key in ACTIVE_ZONES:
        for param_key in ACTIVE_PARAMETERS:
            param_dir = run_dir / zone_key / param_key / f'{run_date}_{run_hour:02d}h'
            if not param_dir.exists():
                continue
            for png_file in sorted(param_dir.glob('H+*.png')):
                stem = png_file.stem
                is_static = stem.endswith('_static')
                step_str = stem.replace('H+', '').replace('_static', '')
                try:
                    step = int(step_str)
                except ValueError:
                    continue

                remote = storage_path(model, zone_key, param_key, run_date, run_hour, step)
                if is_static:
                    remote = remote.replace('.png', '_static.png')

                files.append((str(png_file), remote))

    return files


def upload_model_run(model, run_date, run_hour):
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("SUPABASE_URL / SUPABASE_KEY manquants")

    files = _collect_files(model, run_date, run_hour)
    total = len(files)

    if total == 0:
        log.warning(f"Aucun fichier trouvé pour {model} {run_date}_{run_hour:02d}h")
        return 0, 0

    log.info(f"Début upload parallèle de {total} fichiers ({MAX_WORKERS} threads)...")

    uploaded = 0
    failed = 0
    done = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_remote = {
            executor.submit(upload_file, lp, rp): rp
            for lp, rp in files
        }

        for future in as_completed(future_to_remote):
            remote = future_to_remote[future]
            done += 1
            try:
                ok = future.result()
            except Exception as e:
                log.error(f"Exception pour {remote}: {e}")
                ok = False

            if ok:
                uploaded += 1
            else:
                failed += 1

            # Log de progression toutes les 100 fichiers
            if done % 100 == 0 or done == total:
                log.info(f"  Upload: {done}/{total} ({uploaded} OK, {failed} erreurs)")

    log.info(f"✅ Upload {model} {run_date}_{run_hour:02d}h terminé: {uploaded} OK, {failed} erreurs")
    return uploaded, failed


def update_metadata(model, run_date, run_hour, steps_available):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return

    meta_url = f"{STORAGE_BASE}/object/{BUCKET_NAME}/metadata.json"
    h_get = _headers()

    # Charge le metadata existant
    try:
        r = requests.get(meta_url, headers=h_get, timeout=15)
        meta = json.loads(r.content) if r.status_code == 200 else {'models': {}, 'last_updated': ''}
    except Exception:
        meta = {'models': {}, 'last_updated': ''}

    if model not in meta['models']:
        meta['models'][model] = {'runs': []}

    run_info = {
        'date':  run_date,
        'hour':  run_hour,
        'steps': steps_available,
        'zones': ACTIVE_ZONES,
        'params': ACTIVE_PARAMETERS,
        'generated_at': datetime.now(timezone.utc).isoformat(),
    }

    runs = meta['models'][model]['runs']
    idx = next((i for i, r in enumerate(runs)
                if r['date'] == run_date and r['hour'] == run_hour), None)
    if idx is not None:
        runs[idx] = run_info
    else:
        runs.append(run_info)

    runs.sort(key=lambda r: (r['date'], r['hour']), reverse=True)
    meta['models'][model]['runs'] = runs[:20]
    meta['last_updated'] = datetime.now(timezone.utc).isoformat()

    meta_bytes = json.dumps(meta, ensure_ascii=False, indent=2).encode('utf-8')
    h_put = {**_headers(), 'Content-Type': 'application/json', 'x-upsert': 'true'}

    for attempt in range(1, 4):
        try:
            r = requests.post(meta_url, headers=h_put, data=meta_bytes, timeout=15)
            if r.status_code not in (200, 201):
                r2 = requests.put(meta_url, headers=h_put, data=meta_bytes, timeout=15)
                if r2.status_code not in (200, 201, 204):
                    raise ValueError(f"PUT échoué: {r2.status_code}")
            log.info("✅ metadata.json mis a jour")
            return
        except Exception as e:
            log.warning(f"Tentative {attempt}/3 metadata.json: {e}")
            time.sleep(2)

    log.error("❌ Impossible de mettre à jour metadata.json")


if __name__ == '__main__':
    model    = sys.argv[1] if len(sys.argv) > 1 else 'icon-eu'
    run_date = sys.argv[2] if len(sys.argv) > 2 else '20260529'
    run_hour = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    upload_model_run(model, run_date, run_hour)
