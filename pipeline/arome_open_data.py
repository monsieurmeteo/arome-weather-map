#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PROGRAMME NEUF — Tuiles AROME HD depuis l'open data Météo-France (data.gouv.fr)
==============================================================================
  Données   : paquets GRIB2 AROME 0,01° publiés en open data (gratuit, sans token)
  Décodage  : cfgrib / eccodes
  Projection: Mercator (2200×1640) — France non étirée
  Couleurs  : palettes météociel (vives)

Packages par échéance : HP1 (vent multi-niveaux), SP1 (2m + rafales),
                        SP2 (CAPE, pression, nuages, graupel, neige, pluie), SP3 (altitude)
"""

import os
import re
import sys
import math
import shutil
import tempfile
import datetime
import warnings

import requests
import numpy as np
from PIL import Image

warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "pipeline"))
from fetch_and_render_all import (  # noqa: E402
    PALETTES, BOUNDS, WIDTH, HEIGHT, regrid, apply_palette,
)

# ── Constantes ──────────────────────────────────────────────────────────────
GRIB_BASE = ("https://meteofrance-pnt.s3.rbx.io.cloud.ovh.net/pnt/{run}/arome/001/"
             "{pkg}/arome__001__{pkg}__{lead:02d}H__{run}.grib2")
GRIB_PKGS = ["HP1", "SP1", "SP2", "SP3"]
DATASET_API = ("https://www.data.gouv.fr/api/1/datasets/"
               "paquets-arome-resolution-0-01deg/")
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

# Correspondance champs GRIB (noms cfgrib) → notre paramètre
GRIB_FIELDS = {
    "temperature": "t2m",          # K
    "humidite": "r2",              # %
    "vent_u": "u10",               # m/s
    "vent_v": "v10",               # m/s
    "rafales_u": "efg10",          # m/s (max 10m rafales U)
    "rafales_v": "nfg10",          # m/s (max 10m rafales V)
    "mucape": "CAPE_INS",          # J/kg
    "pression_surface": "sp",      # Pa
    "nuages_bas": "lcc",           # %
    "nuages_moyens": "mcc",        # %
    "nuages_eleves": "hcc",        # %
    "graupel": "tgrp",             # mm
    "pluie_1h": "tirf",            # mm
    "neige": "tsnowp",             # mm
    "neige_au_sol": "si10",        # cm ?
}


# ── Données ─────────────────────────────────────────────────────────────────
def latest_run():
    r = requests.get(DATASET_API, headers=HEADERS, timeout=30)
    r.raise_for_status()
    runs = set()
    for res in r.json().get("resources", []):
        m = re.search(r"__(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)\.grib2",
                      res.get("title", ""))
        if m:
            runs.add(m.group(1))
    if not runs:
        raise RuntimeError("Aucun run AROME sur data.gouv.fr")
    return max(runs)


def available_leads(run_str):
    r = requests.get(DATASET_API, headers=HEADERS, timeout=30)
    r.raise_for_status()
    leads = set()
    for res in r.json().get("resources", []):
        m = re.search(r"__(\d{2})H__" + re.escape(run_str) + r"\.grib2",
                      res.get("title", ""))
        if m:
            leads.add(int(m.group(1)))
    return sorted(leads)


def download_packages(run_str, lead, tmpdir):
    paths = []
    for pkg in GRIB_PKGS:
        url = GRIB_BASE.format(run=run_str, pkg=pkg, lead=lead)
        dst = os.path.join(tmpdir, "%s_%02dH.grib2" % (pkg, lead))
        try:
            r = requests.get(url, headers=HEADERS, timeout=300)
            if r.status_code == 200 and len(r.content) > 1000:
                with open(dst, "wb") as f:
                    f.write(r.content)
                paths.append(dst)
        except Exception:
            pass
    return paths


def decode_raw(paths, shortname):
    """Retourne (valeurs 2D, lats 1D, lons 1D) pour un shortName cfgrib."""
    import cfgrib
    for p in paths:
        try:
            for ds in cfgrib.open_datasets(p):
                for v in ds.data_vars:
                    if v.lower() == shortname.lower():
                        arr = ds[v].values
                        lat = ds.latitude.values
                        lon = ds.longitude.values
                        if lat.ndim == 2:
                            lat = lat[:, 0]
                            lon = lon[0, :]
                        return arr, lat, lon
        except Exception:
            continue
    return None, None, None


# ── Champs physiques ────────────────────────────────────────────────────────
def compute_fields(paths):
    """Extrait et calcule tous les champs physiques bruts."""
    raw = {}
    for key, short in GRIB_FIELDS.items():
        arr, lat, lon = decode_raw(paths, short)
        if arr is not None:
            raw[key] = (arr.astype(np.float32), lat, lon)

    if not raw:
        return None

    # Grille de référence (latitude/longitude du premier champ disponible)
    _, lat0, lon0 = next(iter(raw.values()))

    f = {}

    def reg(key, scale=1.0, offset=0.0):
        if key in raw:
            arr, lat, lon = raw[key]
            d = np.where(np.isfinite(arr), arr, np.nan) * scale + offset
            return d, lat, lon
        return None, None, None

    # ── Champs directs ────────────────────────────────────────────────
    t2m, lat, lon = reg("temperature", 1.0, -273.15)          # °C
    r2, _, _ = reg("humidite")                                # %
    u10, _, _ = reg("vent_u")
    v10, _, _ = reg("vent_v")
    efg_u, _, _ = reg("rafales_u")
    efg_v, _, _ = reg("rafales_v")
    cape, _, _ = reg("mucape")
    sp, _, _ = reg("pression_surface", 1.0 / 100.0)           # hPa
    lcc, _, _ = reg("nuages_bas")
    mcc, _, _ = reg("nuages_moyens")
    hcc, _, _ = reg("nuages_eleves")
    tgrp, _, _ = reg("graupel")
    tirf, _, _ = reg("pluie_1h")
    tsnowp, _, _ = reg("neige")
    si10, _, _ = reg("neige_au_sol")

    fields = {}

    def put(name, arr):
        if arr is not None:
            fields[name] = arr

    put("temperature", t2m)
    put("humidite", r2)
    put("mucape", cape)
    put("pression_surface", sp)
    put("pression", sp)                                      # approximation MSLP
    put("nuages_bas", lcc)
    put("nuages_moyens", mcc)
    put("nuages_eleves", hcc)
    put("graupel", tgrp)
    put("neige", tsnowp)
    put("neige_au_sol", si10)
    put("equivalent_eau_neige", tsnowp)

    # Vent moyen = module (U, V) → km/h
    if u10 is not None and v10 is not None:
        ws = np.sqrt(u10 * u10 + v10 * v10) * 3.6
        put("vent", ws)

    # Rafales = module (efg10, nfg10) → km/h
    if efg_u is not None and efg_v is not None:
        rg = np.sqrt(efg_u * efg_u + efg_v * efg_v) * 3.6
        put("rafales", rg)

    # Pluie horaire (mm) et cumulée
    if tirf is not None:
        put("pluie_1h", tirf)

    # Nébulosité totale = max des 3 couches
    if lcc is not None and mcc is not None and hcc is not None:
        put("nebulosite", np.maximum(np.maximum(lcc, mcc), hcc))

    # Point de rosée (formule de Magnus)
    if t2m is not None and r2 is not None:
        a, b = 17.27, 237.7
        alpha = (a * t2m) / (b + t2m) + np.log(np.clip(r2, 1, 100) / 100.0)
        put("point_rosee", (b * alpha) / (a - alpha))

    # Température ressentie (wind chill si froid + vent, sinon ≈ température)
    if t2m is not None and "vent" in fields:
        v = np.maximum(fields["vent"], 0.0)
        wc = 13.12 + 0.6215 * t2m - 11.37 * np.power(v, 0.16) \
            + 0.3965 * t2m * np.power(v, 0.16)
        put("temperature_ressentie", np.where((t2m <= 10) & (v > 4.8), wc, t2m))

    # Humidex
    if t2m is not None and "point_rosee" in fields:
        td = fields["point_rosee"]
        e = 6.11 * np.exp(5417.7530 * (1.0 / 273.16 - 1.0 / (273.15 + td)))
        put("humidex", t2m + 0.5555 * (e - 10.0))

    # Réflectivité (dBZ) estimée depuis la pluie horaire (Marshall-Palmer)
    if tirf is not None:
        z = 200.0 * np.power(np.maximum(tirf, 0.0), 1.6)
        put("reflectivite", 10.0 * np.log10(z + 1e-6))

    return fields, lat, lon


# ── Rendu ───────────────────────────────────────────────────────────────────
def save_tile(name, arr, lat, lon, out_dir, lead, step_files):
    if arr is None:
        return
    try:
        data = regrid(arr, lat, lon)
    except Exception as e:
        print("  [%s] regrid: %s" % (name, e))
        return
    rgba = apply_palette(data, PALETTES.get(name, PALETTES["temperature"]))
    ddir = os.path.join(out_dir, name)
    os.makedirs(ddir, exist_ok=True)
    dst = os.path.join(ddir, "%03d.webp" % lead)
    Image.fromarray(rgba, "RGBA").save(dst, format="WEBP", quality=85, method=4)
    step_files[name] = "maps/%s/%03d.webp" % (name, lead)


def render_lead(run_str, lead, out_dir, step_files, cumulative):
    tmp = tempfile.mkdtemp(prefix="arome_grib_")
    try:
        paths = download_packages(run_str, lead, tmp)
        if len(paths) < 3:
            print("  H+%02d: packages insuffisants (%d)" % (lead, len(paths)))
            return False
        fields, lat, lon = compute_fields(paths)
        if fields is None:
            print("  H+%02d: aucun champ décodé" % lead)
            return False

        # Cumuls
        if "pluie_1h" in fields:
            cumulative["pluie_cumul"] = cumulative.get("pluie_cumul", 0.0) \
                + np.where(np.isfinite(fields["pluie_1h"]), fields["pluie_1h"], 0.0)
            save_tile("pluie_cumul", cumulative["pluie_cumul"], lat, lon, out_dir, lead, step_files)
        if "rafales" in fields:
            cumulative["rafales_cumul"] = fields["rafales"] if "rafales_cumul" not in cumulative \
                else np.maximum(cumulative["rafales_cumul"], fields["rafales"])
            save_tile("rafales_cumul", cumulative["rafales_cumul"], lat, lon, out_dir, lead, step_files)

        for name in list(fields):
            save_tile(name, fields[name], lat, lon, out_dir, lead, step_files)

        print("  H+%02d: %d couches rendues" % (lead, len(step_files)))
        return True
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def run(max_hours=51):
    """Génère toutes les tuiles AROME (open data) + manifeste."""
    run_str = latest_run()
    leads = available_leads(run_str)
    print("Run AROME: %s | échéances disponibles: %s" % (run_str, len(leads)))
    out_dir = os.path.join(BASE_DIR, "output", "arome", "maps")
    os.makedirs(out_dir, exist_ok=True)
    steps = []
    cumulative = {}
    for lh in sorted(leads):
        if lh > max_hours:
            break
        step_files = {}
        ok = render_lead(run_str, lh, out_dir, step_files, cumulative)
        if ok and step_files:
            vt = datetime.datetime.fromisoformat(run_str.replace("Z", "+00:00")) \
                + datetime.timedelta(hours=lh)
            steps.append({"lead_hour": lh, "valid_time": vt.isoformat(),
                          "files": step_files})
    from fetch_and_render_all import write_manifest
    meta = {"name": "AROME HD (1,3 km)", "provider": "Meteo-France",
            "resolution": "1,3 km (0.01°)", "run_time": run_str}
    write_manifest(out_dir, steps, meta)
    print("OK AROME open data : %d échéances" % len(steps))


if __name__ == "__main__":
    run()
