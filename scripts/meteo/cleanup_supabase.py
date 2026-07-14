"""
Supprime de Supabase Storage les fichiers de plus de 48h via HTTP direct.
"""
import logging
import requests
from datetime import datetime, timezone, timedelta

from config import BUCKET_NAME, SUPABASE_URL, SUPABASE_KEY, ARCHIVE_HOURS

logging.basicConfig(level=logging.INFO, format='%(asctime)s [CLEANUP] %(message)s')
log = logging.getLogger('cleanup')

STORAGE_BASE = f"{SUPABASE_URL}/storage/v1"


def _headers():
    return {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
    }


def list_folder(prefix):
    url  = f"{STORAGE_BASE}/object/list/{BUCKET_NAME}"
    body = {'prefix': prefix, 'limit': 1000, 'offset': 0}
    r    = requests.post(url, headers=_headers(), json=body, timeout=15)
    if r.status_code != 200:
        return []
    return r.json()


def delete_files(paths):
    if not paths:
        return 0
    url  = f"{STORAGE_BASE}/object/{BUCKET_NAME}"
    body = {'prefixes': paths}
    r    = requests.delete(url, headers=_headers(), json=body, timeout=30)
    return len(paths) if r.status_code in (200, 204) else 0


def cleanup_old_files():
    if not SUPABASE_URL or not SUPABASE_KEY:
        log.warning("Variables Supabase manquantes, cleanup ignore")
        return 0

    cutoff  = datetime.now(timezone.utc) - timedelta(hours=ARCHIVE_HOURS)
    deleted = 0

    for model in ['ecmwf', 'icon-eu', 'arome', 'arpege']:
        for zone_item in list_folder(f'{model}/'):
            zone = zone_item.get('name', '')
            for param_item in list_folder(f'{model}/{zone}/'):
                param = param_item.get('name', '')
                prefix = f'{model}/{zone}/{param}/'
                for run_item in list_folder(prefix):
                    run_name = run_item.get('name', '')
                    try:
                        date_part, hour_part = run_name.split('_')
                        run_hour = int(hour_part.replace('h', ''))
                        run_dt = datetime.strptime(
                            f"{date_part} {run_hour:02d}", '%Y%m%d %H'
                        ).replace(tzinfo=timezone.utc)
                    except Exception:
                        continue

                    if run_dt < cutoff:
                        run_prefix = f'{prefix}{run_name}/'
                        files = list_folder(run_prefix)
                        paths = [f'{run_prefix}{f["name"]}' for f in files]
                        for i in range(0, len(paths), 100):
                            deleted += delete_files(paths[i:i+100])

    log.info(f"Nettoyage termine : {deleted} fichiers supprimes (>{ARCHIVE_HOURS}h)")
    return deleted


if __name__ == '__main__':
    cleanup_old_files()
