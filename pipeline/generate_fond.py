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
REGIONS_FILE = os.path.join(BASE_DIR, "config", "regions-france.geojson")
DEPARTEMENTS_URL = ("https://raw.githubusercontent.com/gregoiredavid/"
                    "france-geojson/master/departements.geojson")
MASK_FILE = os.path.join(BASE_DIR, "output", "arome", "maps", "mask_france.png")
SVG_FILE = os.path.join(BASE_DIR, "output", "arome", "maps", "frontieres.svg")

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

    # 2. Les frontières et côtes sont tracées exclusivement par frontieres.svg
    # (évite les dédoublements de contours entre le fond bitmap et le SVG).

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


def _polygon_path(rings, bbox=None):
    """Construit un path SVG 'd' depuis des anneaux projetés (x, y).
    bbox = (xmin, ymin, xmax, ymax) : les anneaux entièrement hors bbox
    sont ignorés (évite des coordonnées gigantesques dans le SVG)."""
    parts = []
    for ring in rings:
        pts = _ring_to_xy(ring)
        if len(pts) < 3:
            continue
        if bbox:
            xs = [p[0] for p in pts]
            ys = [p[1] for p in pts]
            if max(xs) < bbox[0] or min(xs) > bbox[2] or \
                    max(ys) < bbox[1] or min(ys) > bbox[3]:
                continue
        d = "M%.1f %.1f " % pts[0]
        d += "L" + " ".join("%.1f %.1f" % p for p in pts[1:])
        d += "Z"
        parts.append(d)
    return " ".join(parts)


def _load_geojson(path_or_url):
    if path_or_url.startswith("http"):
        req = urllib.request.urlopen(path_or_url, timeout=60)
        return json.loads(req.read().decode("utf-8"))
    with open(path_or_url, encoding="utf-8") as f:
        return json.load(f)


def generate_svg(out_path=None):
    """Régénère frontieres.svg dans la projection EXACTE des tuiles (BOUNDS).
    Trois couches (classées par le front selon stroke-width) :
      - pays (2.0) : frontières internationales
      - régions (1.45) : limites des 13 régions françaises
      - départements (0.8) : contours des 96 départements
    """
    out_path = out_path or SVG_FILE
    countries = _load_geojson(COUNTRIES_FILE)
    regions = _load_geojson(REGIONS_FILE)
    depts = _load_geojson(DEPARTEMENTS_URL)

    def build_paths(collection, keep=None, bbox=None):
        out = []
        for feat in collection.get("features", []):
            props = feat.get("properties", {})
            name = props.get("NAME") or props.get("ADMIN") or \
                props.get("nom") or props.get("name") or ""
            if keep and name not in keep:
                continue
            geom = feat.get("geometry")
            if not geom:
                continue
            # Filtre par bbox de la feature : ignore les pays loin du canvas
            if bbox and feat.get("bbox"):
                fb = feat["bbox"]  # [minLon, minLat, maxLon, maxLat]
                # Convertit les 4 coins en pixels et vérifie l'intersection
                xs = [_project((fb[0], fb[1]))[0], _project((fb[2], fb[1]))[0],
                      _project((fb[0], fb[3]))[0], _project((fb[2], fb[3]))[0]]
                ys = [_project((fb[0], fb[1]))[1], _project((fb[2], fb[1]))[1],
                      _project((fb[0], fb[3]))[1], _project((fb[2], fb[3]))[1]]
                if max(xs) < bbox[0] or min(xs) > bbox[2] or \
                        max(ys) < bbox[1] or min(ys) > bbox[3]:
                    continue
            rings = list(_iter_rings(geom))
            out.append(_polygon_path(rings, bbox))
        return " ".join(p for p in out if p)

    # Pays d'Europe visibles dans le cadre (la France est exclue ici
    # car elle est tracée avec une précision officielle maximale via depts_d).
    WESTERN_EUROPE = {
        "United Kingdom", "Ireland", "Belgium", "Netherlands",
        "Luxembourg", "Germany", "Switzerland", "Austria", "Italy",
        "Spain", "Portugal", "Andorra", "Monaco", "Liechtenstein",
        "Denmark", "Czechia", "Czech Republic", "Poland", "Croatia",
        "Slovenia", "San Marino", "Vatican", "Malta", "Algeria",
        "Morocco", "Tunisia", "Libya",
    }
    import shapely.geometry
    from shapely.ops import unary_union

    # Construire l'union exacte de la France métropolitaine depuis les départements
    france_shapes = [shapely.geometry.shape(f["geometry"]) for f in depts.get("features", [])]
    france_union = unary_union(france_shapes)
    # Buffer de 0.015 degré (~1.5 km) pour absorber toutes les imprécisions de tracé
    france_mask = france_union.buffer(0.015)

    def build_paths_countries(collection, keep=None):
        out = []
        for feat in collection.get("features", []):
            props = feat.get("properties", {})
            name = props.get("NAME") or props.get("ADMIN") or props.get("name") or ""
            if keep and name not in keep:
                continue
            geom = feat.get("geometry")
            if not geom:
                continue
            shape = shapely.geometry.shape(geom)
            # Soustraire la France pour ne pas redessiner les frontières communes
            cleaned = shape.difference(france_mask)
            if cleaned.is_empty:
                continue
            # Reconvertir en anneaux
            if cleaned.geom_type == "Polygon":
                rings = [list(cleaned.exterior.coords)] + [list(i.coords) for i in cleaned.interiors]
            elif cleaned.geom_type == "MultiPolygon":
                rings = []
                for p in cleaned.geoms:
                    rings.append(list(p.exterior.coords))
                    rings.extend([list(i.coords) for i in p.interiors])
            elif cleaned.geom_type in ("GeometryCollection", "MultiLineString", "LineString"):
                continue
            else:
                continue
            out.append(_polygon_path(rings))
        return " ".join(p for p in out if p)

    def build_paths_depts(collection):
        out = []
        for feat in collection.get("features", []):
            geom = feat.get("geometry")
            if not geom:
                continue
            rings = list(_iter_rings(geom))
            out.append(_polygon_path(rings))
        return " ".join(p for p in out if p)

    # 1. Pays d'Europe voisins découpés (les frontières communes avec la France sont effacées)
    pays_d = build_paths_countries(countries, keep=WESTERN_EUROPE)
    # 2. Départements français haute définition (tracé unique pour toute la France et ses frontières)
    depts_d = build_paths_depts(depts)

    svg = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<svg xmlns="http://www.w3.org/2000/svg" '
        'viewBox="0 0 %d %d" width="%d" height="%d">\n'
        '<path d="%s" fill="none" stroke="#1a1f26" stroke-width="1.8" '
        'stroke-linejoin="round" stroke-linecap="round"/>\n'
        '<path d="%s" fill="none" stroke="#1a1f26" stroke-width="1.2" '
        'stroke-linejoin="round" stroke-linecap="round"/>\n'
        '</svg>\n' % (WIDTH, HEIGHT, WIDTH, HEIGHT, pays_d, depts_d)
    )
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(svg)
    print("SVG frontières régénéré (frontières communes uniques) : %s (%d octets)" % (out_path, len(svg)))
    return out_path


def generate_all():
    """Génère le fond de carte + le masque France + les frontières (projection
    identique aux tuiles → plus aucun décalage)."""
    maps_dir = os.path.join(BASE_DIR, "output", "arome", "maps")
    generate_fond(os.path.join(maps_dir, "fond.webp"))
    generate_france_mask(os.path.join(maps_dir, "mask_france.png"))
    generate_svg(os.path.join(maps_dir, "frontieres.svg"))


if __name__ == "__main__":
    generate_all()
