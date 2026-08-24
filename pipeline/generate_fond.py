#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur du fond de carte (style Positron, comme meteo-npdc.fr)
=================================================================
Produit output/arome/maps/fond.webp : une carte 2200×1640 (Mercator) avec
  - océan bleu-gris (#8FA3B8 ≈ Positron water)
  - terres gris très clair (#ECE9E2 ≈ Positron land)
  - frontières des pays (gris moyen), avec la France mise en évidence
Le tout est ensuite utilisé comme fond par le moteur cartographique.
"""

import os
import json
import math
import sys
import urllib.request

import numpy as np
from PIL import Image, ImageDraw

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "pipeline"))
from fetch_and_render_all import BOUNDS, WIDTH, HEIGHT  # noqa: E402

COUNTRIES_FILE = os.path.join(BASE_DIR, "config", "countries-50m.geojson")
DEPARTEMENTS_URL = ("https://raw.githubusercontent.com/gregoiredavid/"
                    "france-geojson/master/departements.geojson")
MASK_FILE = os.path.join(BASE_DIR, "output", "arome", "maps", "mask_france.png")

# Couleurs style Positron (cartes claires MapLibre, comme meteo-npdc)
OCEAN = (143, 163, 184)        # #8FA3B8
LAND = (237, 234, 226)         # #EDEAE2
LAND_FRANCE = (232, 228, 218)  # France légèrement distincte
BORDER = (160, 165, 170)       # frontières internationales
FRANCE_BORDER = (120, 128, 136)


def _mercator_y(lat):
    return math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


def _project(coord):
    """Longitude/latitude → pixel (Mercator) dans la grille BOUNDS."""
    lon, lat = coord
    west, east = BOUNDS["west"], BOUNDS["east"]
    north, south = BOUNDS["north"], BOUNDS["south"]
    ny = _mercator_y(north)
    sy = _mercator_y(south)
    u = (lon - west) / (east - west)
    v = (ny - _mercator_y(lat)) / (ny - sy)
    return (u * (WIDTH - 1), v * (HEIGHT - 1))


def _iter_rings(geometry):
    """Itère sur les anneaux (listes de coordonnées) d'une géométrie."""
    t = geometry["type"]
    if t == "Polygon":
        yield from geometry["coordinates"]
    elif t == "MultiPolygon":
        for poly in geometry["coordinates"]:
            yield from poly


def _ring_to_xy(ring):
    pts = [_project(c) for c in ring]
    return [(float(x), float(y)) for x, y in pts]


def generate_fond(out_path):
    """Génère le fond de carte 2200×1640 et l'enregistre en WebP."""
    with open(COUNTRIES_FILE, encoding="utf-8") as f:
        data = json.load(f)

    img = Image.new("RGB", (WIDTH, HEIGHT), OCEAN)
    draw = ImageDraw.Draw(img)

    # 1. Remplissage des terres (pays)
    france_names = {"France", "French Guiana"}
    for feat in data.get("features", []):
        props = feat.get("properties", {})
        name = props.get("NAME") or props.get("ADMIN") or props.get("name") or ""
        geom = feat.get("geometry")
        if not geom:
            continue
        fill = LAND_FRANCE if name in france_names else LAND
        for ring in _iter_rings(geom):
            pts = _ring_to_xy(ring)
            if len(pts) >= 3:
                draw.polygon(pts, fill=fill)

    # 2. Frontières internationales (traits fins) + France plus marquée
    for feat in data.get("features", []):
        props = feat.get("properties", {})
        name = props.get("NAME") or props.get("ADMIN") or props.get("name") or ""
        geom = feat.get("geometry")
        if not geom:
            continue
        colour = FRANCE_BORDER if name in france_names else BORDER
        width = 3 if name in france_names else 2
        for ring in _iter_rings(geom):
            pts = _ring_to_xy(ring)
            if len(pts) >= 2:
                draw.line(pts, fill=colour, width=width, joint="curve")

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, format="WEBP", quality=90, method=6)
    print("Fond de carte généré : %s (%dx%d)" % (out_path, WIDTH, HEIGHT))
    return out_path


def generate_france_mask(out_path=None):
    """Masque France précis (255 = France, 0 = extérieur) dans les bornes
    EXACTES des tuiles (BOUNDS). Sans lui, la météo déborde sur les pays
    voisins et la mer."""
    out_path = out_path or MASK_FILE
    try:
        req = urllib.request.urlopen(DEPARTEMENTS_URL, timeout=60)
        data = json.loads(req.read().decode("utf-8"))
    except Exception as e:
        print("WARNING: masque France non généré (%s)" % e)
        return None

    img = Image.new("L", (WIDTH, HEIGHT), 0)
    draw = ImageDraw.Draw(img)
    for feature in data.get("features", []):
        geom = feature.get("geometry", {})
        gtype = geom.get("type")
        coords = geom.get("coordinates", [])
        if gtype == "Polygon":
            for ring in coords:
                pts = [_project((pt[0], pt[1])) for pt in ring]
                draw.polygon(pts, fill=255)
        elif gtype == "MultiPolygon":
            for poly in coords:
                for ring in poly:
                    pts = [_project((pt[0], pt[1])) for pt in ring]
                    draw.polygon(pts, fill=255)

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, format="PNG")
    print("Masque France généré : %s" % out_path)
    return out_path


def generate_all():
    """Génère le fond de carte + le masque France (bornes correctes)."""
    maps_dir = os.path.join(BASE_DIR, "output", "arome", "maps")
    generate_fond(os.path.join(maps_dir, "fond.webp"))
    generate_france_mask(os.path.join(maps_dir, "mask_france.png"))


if __name__ == "__main__":
    generate_all()
