"""
Génère les cartes PNG par modèle, zone, paramètre et échéance.
Style proche Meteociel : fond relief baked-in, palettes pros, isohypses géopotentiel,
info du run en bas de carte, barre de couleur.
"""
import sys
import logging
import warnings
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import matplotlib.ticker as mticker
from matplotlib.colors import LinearSegmentedColormap, BoundaryNorm
from matplotlib.patches import FancyBboxPatch
import matplotlib.patheffects as pe
from pathlib import Path
from datetime import datetime, timezone, timedelta

warnings.filterwarnings('ignore')

try:
    import cartopy.crs as ccrs
    import cartopy.feature as cfeature
    from cartopy.mpl.gridliner import LONGITUDE_FORMATTER, LATITUDE_FORMATTER
    HAS_CARTOPY = True
except ImportError:
    HAS_CARTOPY = False
    print("WARNING: pip install cartopy")

try:
    from scipy.ndimage import gaussian_filter
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False

try:
    from shapely.geometry import shape
    from shapely.ops import unary_union
    from matplotlib.path import Path as MPath
    from matplotlib.patches import PathPatch
    HAS_SHAPELY = True
except ImportError:
    HAS_SHAPELY = False
    print("WARNING: shapely or matplotlib path features not available")

import json
import urllib.request

from config import ZONES, ACTIVE_ZONES, PARAMETERS, ACTIVE_PARAMETERS, MODELS

logging.basicConfig(level=logging.INFO, format='%(asctime)s [MAPS] %(message)s')
log = logging.getLogger('maps')

OUTPUT_DIR = Path('data/output')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# ─── PALETTES DE COULEURS ── style météorologique professionnel ───────────────
def make_cmap(colors_list):
    return LinearSegmentedColormap.from_list('', colors_list)


CMAPS = {
    # Température : bleu profond → cyan → vert → jaune → orange → rouge foncé
    'temp': make_cmap([
        '#440055', '#660099', '#000088', '#0000cc', '#0033ff', '#0088ff', '#00ccff',
        '#00ffff', '#88ffff', '#00ff00', '#77ff00', '#bbff00', '#ffff00', '#ffcc00',
        '#ff9900', '#ff6600', '#ff0000', '#cc0000', '#990000', '#660000', '#440000',
        '#880088', '#cc00cc', '#ff00ff'
    ]),
    # Vent / Rafales : blanc → vert clair → vert → jaune → orange → rouge → violet
    'wind': make_cmap([
        '#ffffff', '#e8fce8', '#99ee99', '#44cc44', '#00aa00',
        '#ffff44', '#ffcc00', '#ff8800', '#ff4400', '#cc0000',
        '#880033', '#550055', '#220033',
    ]),
    # Précipitations : transparent → bleu pâle → bleu → violet → magenta
    'precip': make_cmap([
        '#ffffff00', '#d4f0ff', '#99d4ff', '#4499ff', '#0044ff',
        '#0000cc', '#5500cc', '#aa00cc', '#ff00aa', '#ff0055',
        '#aa0000',
    ]),
    # Pression : bleu profond → blanc → rouge foncé
    'pressure': make_cmap([
        '#00007f', '#0000ff', '#4488ff', '#aaddff',
        '#ffffff',
        '#ffddaa', '#ff8844', '#ff2200', '#880000',
    ]),
    # Géopotentiel 500hPa : violet → bleu → vert → jaune → rouge (centres d'action)
    'geopotential': make_cmap([
        '#330088', '#0000dd', '#0066ff', '#00aaff',
        '#00ddcc', '#00cc66', '#88dd00',
        '#ffff00', '#ffcc00', '#ff8800',
        '#ff4400', '#cc0000', '#660000',
    ]),
    # Nébulosité : transparent → gris clair → gris moyen → gris foncé
    'clouds': make_cmap([
        '#ffffff00', '#f0f0f088', '#d0d0d0aa',
        '#b0b0b0bb', '#909090cc', '#606060dd',
        '#404040ee',
    ]),
    # CAPE : transparent → jaune → orange → rouge → violet
    'cape': make_cmap([
        '#ffffff00', '#ffff8888', '#ffff00', '#ffcc00',
        '#ff8800', '#ff4400', '#ff0000',
        '#cc0066', '#880099', '#440066',
    ]),
    # Humidité : beige sec → vert → bleu profond
    'humidity': make_cmap([
        '#fff8e8', '#ffe0a0', '#ffcc44', '#aadd66',
        '#44cc44', '#0099cc', '#0044cc', '#001188',
    ]),
    # Neige : transparent → bleu très clair → bleu → bleu profond → violet
    'snow': make_cmap([
        '#ffffff00', '#e8f4ff', '#aadcff',
        '#66aaff', '#3366ff', '#0000cc',
        '#440099', '#220055',
    ]),
}


# ─── FOND DE CARTE STYLE METEOCIEL ────────────────────────────────────────────
DEPARTMENTS_GEOJSON = None

def load_departments_geojson():
    global DEPARTMENTS_GEOJSON
    if DEPARTMENTS_GEOJSON is not None:
        return DEPARTMENTS_GEOJSON
    
    geojson_path = Path('data/departements.geojson')
    if not geojson_path.exists():
        geojson_path.parent.mkdir(parents=True, exist_ok=True)
        url = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson"
        try:
            log.info("Téléchargement du GeoJSON des départements français...")
            req = urllib.request.Request(
                url, 
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                content = response.read()
            with open(geojson_path, 'wb') as f:
                f.write(content)
            log.info("Téléchargement du GeoJSON réussi.")
        except Exception as e:
            log.error(f"Impossible de télécharger le GeoJSON : {e}")
            return None
            
    try:
        with open(geojson_path, 'r', encoding='utf-8') as f:
            DEPARTMENTS_GEOJSON = json.load(f)
            return DEPARTMENTS_GEOJSON
    except Exception as e:
        log.error(f"Impossible de lire le GeoJSON : {e}")
        return None


ZONE_GEOMETRIES = {}

def get_zone_geometry(zone_key):
    global ZONE_GEOMETRIES
    if zone_key in ZONE_GEOMETRIES:
        return ZONE_GEOMETRIES[zone_key]
        
    if not HAS_SHAPELY:
        return None
        
    geojson_data = load_departments_geojson()
    if not geojson_data:
        return None
        
    try:
        if zone_key == 'france':
            geoms = [shape(f['geometry']) for f in geojson_data['features']]
            ZONE_GEOMETRIES[zone_key] = unary_union(geoms)
        elif zone_key == 'hauts-de-france':
            hdf_dept_codes = {'02', '59', '60', '62', '80'}
            geoms = [
                shape(f['geometry']) 
                for f in geojson_data['features'] 
                if f['properties'].get('code') in hdf_dept_codes
            ]
            ZONE_GEOMETRIES[zone_key] = unary_union(geoms)
        else:
            ZONE_GEOMETRIES[zone_key] = None
    except Exception as e:
        log.error(f"Error computing geometry for zone {zone_key}: {e}")
        ZONE_GEOMETRIES[zone_key] = None
        
    return ZONE_GEOMETRIES[zone_key]


def shapely_to_path(geom):
    """Convertit un Polygon ou MultiPolygon shapely en Path matplotlib."""
    if not HAS_SHAPELY or geom is None:
        return None
    if geom.geom_type == 'Polygon':
        polys = [geom]
    elif geom.geom_type == 'MultiPolygon':
        polys = geom.geoms
    else:
        return None
        
    codes = []
    vertices = []
    
    for poly in polys:
        # Contour extérieur
        exterior = poly.exterior
        xs, ys = exterior.xy
        for i, (x, y) in enumerate(zip(xs, ys)):
            vertices.append((x, y))
            if i == 0:
                codes.append(MPath.MOVETO)
            else:
                codes.append(MPath.LINETO)
        codes[-1] = MPath.CLOSEPOLY
        
        # Trous
        for interior in poly.interiors:
            xs, ys = interior.xy
            for i, (x, y) in enumerate(zip(xs, ys)):
                vertices.append((x, y))
                if i == 0:
                    codes.append(MPath.MOVETO)
                else:
                    codes.append(MPath.LINETO)
            codes[-1] = MPath.CLOSEPOLY
            
    return MPath(vertices, codes)


def clip_plot_to_geometry(ax, plot_obj, geom):
    """Clip a matplotlib plot object (ContourSet, Barbs, etc.) to a shapely geometry."""
    if not HAS_SHAPELY or geom is None:
        return
    path = shapely_to_path(geom)
    if path is None:
        return
    transform = ccrs.PlateCarree() if (HAS_CARTOPY and 'ccrs' in globals()) else ax.transData
    clip_patch = PathPatch(path, transform=transform, facecolor='none', edgecolor='none')
    ax.add_patch(clip_patch)
    
    if hasattr(plot_obj, 'collections'):
        for collection in plot_obj.collections:
            collection.set_clip_path(clip_patch)
    else:
        plot_obj.set_clip_path(clip_patch)


def draw_shapely_boundary(ax, geom, color='#001122', linewidth=1.2, zorder=6):
    """Trace les contours extérieurs et intérieurs d'une géométrie shapely (Polygon ou MultiPolygon)."""
    if not HAS_SHAPELY or geom is None:
        return
    if geom.geom_type == 'Polygon':
        polys = [geom]
    elif geom.geom_type == 'MultiPolygon':
        polys = geom.geoms
    else:
        return
        
    kwargs = {'color': color, 'linewidth': linewidth, 'zorder': zorder}
    if HAS_CARTOPY:
        kwargs['transform'] = ccrs.PlateCarree()
        
    for poly in polys:
        xs, ys = poly.exterior.xy
        ax.plot(xs, ys, **kwargs)
        for interior in poly.interiors:
            xs, ys = interior.xy
            ax.plot(xs, ys, **kwargs)


def add_basemap_background(ax, zone_key):
    """Ajoute le fond géographique (relief, terre, mer, lacs, rivières) sous les données météo."""
    if not HAS_CARTOPY:
        # Fallback de couleur pour la terre
        ax.set_facecolor('#e8e0d8')
        return

    # Fond océan / terre en couleurs neutres
    ax.add_feature(cfeature.OCEAN.with_scale('50m'),
                   facecolor='#c8dff2', zorder=0)
    ax.add_feature(cfeature.LAND.with_scale('50m'),
                   facecolor='#e8e0d8', zorder=0)

    # Relief — ombrage hillshade via Natural Earth
    ax.add_feature(cfeature.NaturalEarthFeature(
        'physical', 'land', '50m',
        facecolor=cfeature.COLORS['land'],
    ), zorder=0)

    # Lacs
    ax.add_feature(cfeature.LAKES.with_scale('50m'),
                   facecolor='#b8d4e8', edgecolor='#888', linewidth=0.3, zorder=1)

    # Rivières pour zoom régional
    if zone_key == 'hauts-de-france':
        ax.add_feature(cfeature.RIVERS.with_scale('10m'),
                       edgecolor='#7ab0cc', linewidth=0.5, zorder=1)
    elif zone_key == 'france':
        ax.add_feature(cfeature.RIVERS.with_scale('50m'),
                       edgecolor='#7ab0cc', linewidth=0.3, zorder=1)


def add_basemap_boundaries(ax, zone_key, geojson_data=None):
    """Ajoute les tracés géographiques (côtes, frontières, départements, régions) par-dessus les données météo."""
    # Si Cartopy est actif, on ajoute les côtes et les frontières européennes standard en noir
    if HAS_CARTOPY:
        scale = '10m' if zone_key == 'hauts-de-france' else '50m'
        # Côtes (très nettes et sombres, noires)
        ax.add_feature(cfeature.COASTLINE.with_scale(scale),
                       linewidth=0.8, edgecolor='#000000', zorder=6)
        # Frontières nationales (très visibles, noires)
        ax.add_feature(cfeature.BORDERS.with_scale(scale),
                       linewidth=1.0, edgecolor='#000000', zorder=6)

    # Dans tous les cas (Cartopy ou Fallback), si le GeoJSON est disponible, on dessine les départements français
    if geojson_data and HAS_SHAPELY:
        from matplotlib.collections import LineCollection
        segments = []
        for feature in geojson_data.get('features', []):
            geom = feature.get('geometry', {})
            gtype = geom.get('type')
            coords = geom.get('coordinates', [])
            if gtype == 'Polygon':
                for ring in coords:
                    segments.append(np.array(ring))
            elif gtype == 'MultiPolygon':
                for poly in coords:
                    for ring in poly:
                        segments.append(np.array(ring))
        
        # départements : tracés fins noirs (comme sur la capture d'écran Arpege)
        transform = ccrs.PlateCarree() if HAS_CARTOPY else ax.transData
        lc_depts = LineCollection(segments, colors='#000000', linewidths=0.4, alpha=0.6, zorder=6, transform=transform)
        ax.add_collection(lc_depts)
        
        # En mode Fallback (Windows local), on trace au moins la frontière de la zone (contour de France/HDF) en noir
        if not HAS_CARTOPY:
            zone_geom = get_zone_geometry(zone_key)
            if zone_geom:
                draw_shapely_boundary(ax, zone_geom, color='#000000', linewidth=1.0, zorder=6)
            
        # En mode Cartopy, ajouter également les frontières régionales en noir
        if HAS_CARTOPY:
            ax.add_feature(cfeature.NaturalEarthFeature(
                'cultural', 'admin_1_states_provinces_lines', '10m',
                facecolor='none', edgecolor='#000000', linewidth=0.7,
            ), zorder=6)
    else:
        # Fallback basique si pas de GeoJSON
        if HAS_CARTOPY:
            ax.add_feature(cfeature.NaturalEarthFeature(
                'cultural', 'admin_1_states_provinces_lines', '10m',
                facecolor='none', edgecolor='#000000', linewidth=0.7,
            ), zorder=6)


def add_gridlines(ax, zone_key):
    """Ajoute graticule de coordonnées."""
    if not HAS_CARTOPY:
        return
    gl = ax.gridlines(draw_labels=True, linewidth=0.3, color='#aaaaaa',
                      alpha=0.6, linestyle='--', zorder=7)
    gl.top_labels   = False
    gl.right_labels = False
    gl.xlabel_style = {'size': 7, 'color': '#444444'}
    gl.ylabel_style = {'size': 7, 'color': '#444444'}
    step = 1 if zone_key == 'hauts-de-france' else (2 if zone_key == 'france' else 5)
    gl.xlocator = mticker.MultipleLocator(step)
    gl.ylocator = mticker.MultipleLocator(step)


def add_run_info(fig, ax, model_key, run_date, run_hour, step, param_key):
    """Bande d'info en bas de carte, plus cartouches pro en haut à gauche et à droite (Meteociel-style)."""
    model  = MODELS[model_key]
    param  = PARAMETERS[param_key]
    run_dt = datetime.strptime(f"{run_date}{run_hour:02d}", '%Y%m%d%H')
    valid_dt = run_dt + timedelta(hours=step)

    # 1. Cartouche Info en haut à gauche de la carte (Date et échéance)
    info_text = (
        f"Modèle : {model['name']} ({model['resolution']})\n"
        f"Run de départ : {run_dt.strftime('%d/%m/%Y à %Hh')} UTC\n"
        f"Échéance : +{step}h (validé pour le {valid_dt.strftime('%d/%m/%Y à %Hh')} UTC)"
    )
    
    bbox_info = dict(
        boxstyle="round,pad=0.4",
        facecolor="white",
        edgecolor="#334155",
        alpha=0.92,
        linewidth=0.8,
        zorder=10
    )
    ax.text(
        0.015, 0.985, info_text,
        fontsize=6, color='#1e293b',
        fontweight='bold',
        va='top', ha='left',
        transform=ax.transAxes,
        bbox=bbox_info,
        zorder=10
    )

    # 2. Dessiner le logo Météo Climat Pro en haut à droite si présent
    has_logo = False
    logo_path = Path('public/logo.jpg')
    if logo_path.exists():
        try:
            from matplotlib.offsetbox import OffsetImage, AnnotationBbox
            logo_img = plt.imread(str(logo_path))
            # Zoom pour insérer le logo de manière élégante et compacte (3:1 aspect ratio)
            imagebox = OffsetImage(logo_img, zoom=0.08)
            ab = AnnotationBbox(imagebox, (0.985, 0.985), xycoords='axes fraction',
                                frameon=False, box_alignment=(1.0, 1.0), zorder=11)
            ax.add_artist(ab)
            has_logo = True
        except Exception as e:
            log.warning(f"Impossible de dessiner le logo : {e}")

    # 3. Cartouche Paramètre en haut à droite (placé sous le logo si existant)
    param_text = f"{param['label']} ({param['unit']})"
    y_pos = 0.89 if has_logo else 0.985
    
    bbox_param = dict(
        boxstyle="round,pad=0.4",
        facecolor="#1e3a8a",
        edgecolor="#1e3a8a",
        alpha=0.95,
        linewidth=0.8,
        zorder=10
    )
    ax.text(
        0.985, y_pos, param_text,
        fontsize=6.5, color='white',
        fontweight='bold',
        va='top', ha='right',
        transform=ax.transAxes,
        bbox=bbox_param,
        zorder=10
    )

    # 4. Bandeau de bas de page (Copyright et signature)
    gen_ts = datetime.now(timezone.utc).strftime('Généré le %d/%m/%Y à %Hh%M UTC')
    fig.text(0.99, 0.005, gen_ts,
             fontsize=5, color='#666666', va='bottom', ha='right',
             path_effects=[pe.withStroke(linewidth=2, foreground='white')])


def add_colorbar(fig, cf, param_key, zone_key):
    """Légende couleur en bas de la carte."""
    param = PARAMETERS[param_key]

    # Position selon la zone
    if zone_key == 'europe':
        cbar_ax = fig.add_axes([0.10, 0.04, 0.80, 0.018])
    elif zone_key == 'hauts-de-france':
        cbar_ax = fig.add_axes([0.10, 0.05, 0.80, 0.022])
    else:
        cbar_ax = fig.add_axes([0.10, 0.045, 0.80, 0.020])

    cb = plt.colorbar(cf, cax=cbar_ax, orientation='horizontal',
                      extend=param.get('extend', 'both'))
    cb.ax.tick_params(labelsize=7)
    # Le label est géré dans add_run_info pour éviter la superposition


def to_mercator_lat(lat_deg):
    """
    Projette des latitudes en degrés dans le système Spherical Mercator (Web Mercator / EPSG:3857).
    """
    lat_rad = np.radians(lat_deg)
    return np.degrees(np.log(np.tan(np.pi / 4.0 + lat_rad / 2.0)))


# ─── GÉNÉRATION D'UNE CARTE ────────────────────────────────────────────────────
def generate_map(lats, lons, data, param_key, zone_key, output_path,
                 model_key='icon-eu', run_date='20260101', run_hour=0, step=0,
                 u_wind=None, v_wind=None, is_static=False):
    """
    Génère une carte PNG :
    - Si is_static est False : carte transparente, cadrée au pixel près pour Leaflet (Web Mercator).
    - Si is_static est True : carte complète avec relief, frontières, légende et infos de run (Meteociel-style).
    """
    param = PARAMETERS[param_key]
    zone  = ZONES[zone_key]
    lon_min, lon_max, lat_min, lat_max = zone['bounds']

    cmap   = CMAPS.get(param['cmap'], plt.cm.viridis)
    levels = param['levels']
    norm   = BoundaryNorm(levels, cmap.N)

    # Lissage léger pour rendu plus doux
    if HAS_SCIPY and data.shape[0] > 10:
        sigma = 0.8 if zone_key == 'hauts-de-france' else 0.5
        data_smooth = gaussian_filter(data, sigma=sigma)
    else:
        data_smooth = data

    # Récupérer la géométrie de la zone pour clip (contours de France ou HDF)
    zone_geom = get_zone_geometry(zone_key)
    geojson_data = load_departments_geojson()

    # Création de la figure
    fig = plt.figure(figsize=zone['figsize'], dpi=zone['dpi'])

    if not is_static:
        # ───────── CALQUE DE DONNÉES PURE POUR LEAFLET (MERCATOR NON-LINÉAIRE) ─────────
        ax = fig.add_axes([0, 0, 1, 1])
        ax.set_axis_off()
        fig.patch.set_alpha(0.0)
        ax.patch.set_visible(False)

        # Projection des coordonnées de latitude de degrés en coordonnées Web Mercator
        lats_proj = to_mercator_lat(lats)
        lat_min_proj = to_mercator_lat(lat_min)
        lat_max_proj = to_mercator_lat(lat_max)

        # Données colorées
        cf = ax.contourf(lons, lats_proj, data_smooth, levels=levels, cmap=cmap, norm=norm,
                         extend=param.get('extend', 'both'), alpha=0.60)
        
        # Isobares si demandé (ex: pression)
        if param.get('isobars', False):
            isobar_step = param.get('isobar_step', 5)
            iso_levels  = [l for l in levels if l % isobar_step == 0]
            cs = ax.contour(lons, lats_proj, data_smooth, levels=iso_levels, colors='#222222', linewidths=0.6)

        # Flèches de vent (si disponibles)
        if u_wind is not None and v_wind is not None:
            step_arrow = max(1, lons.shape[1] // 18)
            barbs = ax.barbs(
                lons[::step_arrow, ::step_arrow],
                lats_proj[::step_arrow, ::step_arrow],
                u_wind[::step_arrow, ::step_arrow],
                v_wind[::step_arrow, ::step_arrow],
                length=4.5, linewidth=0.6, color='#222222',
            )

        # Cadrage strict et absolu sur la Bounding Box géographique projetée
        ax.set_xlim(lon_min, lon_max)
        ax.set_ylim(lat_min_proj, lat_max_proj)

    else:
        # ───────── CARTE STATIQUE HABILLÉE (STYLE METEOCIEL PRO) ─────────
        if HAS_CARTOPY:
            # Use Mercator projection centered on the zone to avoid geographic squishing
            proj = ccrs.Mercator(central_longitude=(lon_min + lon_max) / 2.0)
            ax = fig.add_axes([0.05, 0.08, 0.90, 0.88], projection=proj)
            ax.set_extent([lon_min, lon_max, lat_min, lat_max], crs=ccrs.PlateCarree())
            
            # 1. Dessiner le fond géographique (relief, terre, mer, lacs, rivières) sous la météo
            add_basemap_background(ax, zone_key)
            
            # 2. Dessiner les données météo par-dessus le fond
            cf = ax.contourf(lons, lats, data_smooth, levels=levels, cmap=cmap, norm=norm,
                             extend=param.get('extend', 'both'), alpha=0.60, transform=ccrs.PlateCarree())
            
            # Isobares
            if param.get('isobars', False):
                isobar_step = param.get('isobar_step', 5)
                iso_levels  = [l for l in levels if l % isobar_step == 0]
                cs = ax.contour(lons, lats, data_smooth, levels=iso_levels, colors='#222222', linewidths=0.6,
                           transform=ccrs.PlateCarree())

            # Flèches de vent
            if u_wind is not None and v_wind is not None:
                step_arrow = max(1, lons.shape[1] // 18)
                barbs = ax.barbs(
                    lons[::step_arrow, ::step_arrow],
                    lats[::step_arrow, ::step_arrow],
                    u_wind[::step_arrow, ::step_arrow],
                    v_wind[::step_arrow, ::step_arrow],
                    length=4.5, linewidth=0.6, color='#222222',
                    transform=ccrs.PlateCarree(),
                )
                
            # 3. Dessiner les frontières et les graticules par-dessus la météo (haute visibilité)
            add_basemap_boundaries(ax, zone_key, geojson_data=geojson_data)
            add_gridlines(ax, zone_key)
        else:
            # Fallback matplotlib pur
            ax = fig.add_axes([0.05, 0.08, 0.90, 0.88])
            center_lat = (lat_min + lat_max) / 2.0
            ax.set_aspect(1.0 / np.cos(np.radians(center_lat)))
            
            # 1. Dessiner le fond géographique (relief, terre, mer, lacs, rivières) sous la météo
            add_basemap_background(ax, zone_key)
            
            # 2. Dessiner les données météo par-dessus le fond
            cf = ax.contourf(lons, lats, data_smooth, levels=levels, cmap=cmap, norm=norm,
                             extend=param.get('extend', 'both'), alpha=0.60)
            
            # Isobares
            if param.get('isobars', False):
                isobar_step = param.get('isobar_step', 5)
                iso_levels  = [l for l in levels if l % isobar_step == 0]
                cs = ax.contour(lons, lats, data_smooth, levels=iso_levels, colors='#222222', linewidths=0.6)
            
            # Flèches de vent
            if u_wind is not None and v_wind is not None:
                step_arrow = max(1, lons.shape[1] // 18)
                barbs = ax.barbs(
                    lons[::step_arrow, ::step_arrow],
                    lats[::step_arrow, ::step_arrow],
                    u_wind[::step_arrow, ::step_arrow],
                    v_wind[::step_arrow, ::step_arrow],
                    length=4.5, linewidth=0.6, color='#222222',
                )
            
            # 3. Dessiner les frontières et départements par-dessus la météo
            add_basemap_boundaries(ax, zone_key, geojson_data=geojson_data)
            
            ax.set_xlim(lon_min, lon_max)
            ax.set_ylim(lat_min, lat_max)
            ax.set_axis_off()

        # Ajout des infos de run, de la colorbar et du copyright
        add_colorbar(fig, cf, param_key, zone_key)
        add_run_info(fig, ax, model_key, run_date, run_hour, step, param_key)

        # Ajouter une signature copyright élégante Météo Climat Pro en bas
        fig.text(0.5, 0.005, 'Météo-France • Météo Climat Pro',
                 fontsize=6, color='#333333', va='bottom', ha='center',
                 path_effects=[pe.withStroke(linewidth=2, foreground='white')])

    # Sauvegarde
    output_path.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(
        str(output_path),
        dpi=zone['dpi'],
        bbox_inches=None if not is_static else 'tight',
        pad_inches=0 if not is_static else 0.1,
        transparent=not is_static,
        format='png',
        facecolor='none' if not is_static else 'white',
    )
    plt.close(fig)



# ─── LECTURE GRIB ECMWF ───────────────────────────────────────────────────────
def read_grib_ecmwf(grib_file, param_key, step):
    import xarray as xr
    param = PARAMETERS[param_key]
    ep    = param['ecmwf_param']
    conv  = param['convert_ecmwf']

    filter_keys = {'step': np.timedelta64(step * 3600, 's')}

    # Géopotentiel sur niveau de pression
    if param.get('ecmwf_levtype') == 'pl':
        filter_keys['typeOfLevel'] = 'isobaricInhPa'
        filter_keys['level']       = param.get('ecmwf_level', 500)

    try:
        if isinstance(ep, list):
            ds_u = xr.open_dataset(grib_file, engine='cfgrib',
                                   backend_kwargs={'filter_by_keys':
                                       {**filter_keys, 'shortName': ep[0]}})
            ds_v = xr.open_dataset(grib_file, engine='cfgrib',
                                   backend_kwargs={'filter_by_keys':
                                       {**filter_keys, 'shortName': ep[1]}})
            u    = ds_u[list(ds_u.data_vars)[0]].values
            v    = ds_v[list(ds_v.data_vars)[0]].values
            lats = ds_u.latitude.values
            lons = ds_u.longitude.values
            data = conv(u, v)
            return lats, lons, data, u, v
        else:
            ds   = xr.open_dataset(grib_file, engine='cfgrib',
                                   backend_kwargs={'filter_by_keys':
                                       {**filter_keys, 'shortName': ep}})
            var  = list(ds.data_vars)[0]
            lats = ds.latitude.values
            lons = ds.longitude.values
            data = conv(ds[var].values)
            return lats, lons, np.where(np.isfinite(data), data, np.nan), None, None
    except Exception as e:
        log.debug(f"  Lecture {param_key} H+{step}: {e}")
        return None, None, None, None, None


# ─── LOGIQUE DE TRAITEMENT PAR PAS DE TEMPS (POUR PARALLÉLISATION) ─────────────

def process_ecmwf_step(step, grib_file, run_date, run_hour):
    """Génère les cartes ECMWF pour un pas de temps donné."""
    import xarray as xr
    import numpy as np
    
    total = 0
    # On itère sur les paramètres actifs
    for param_key in ACTIVE_PARAMETERS:
        lats, lons, data, u, v = read_grib_ecmwf(grib_file, param_key, step)
        if data is None:
            continue
        for zone_key in ACTIVE_ZONES:
            zone = ZONES[zone_key]
            lon_min, lon_max, lat_min, lat_max = zone['bounds']
            lon_m = (lons >= lon_min) & (lons <= lon_max)
            lat_m = (lats >= lat_min) & (lats <= lat_max)
            lats_c   = lats[lat_m]
            lons_c   = lons[lon_m]
            data_c   = data[np.ix_(lat_m, lon_m)]
            lons_2d, lats_2d = np.meshgrid(lons_c, lats_c)
            u_c = u[np.ix_(lat_m, lon_m)] if u is not None else None
            v_c = v[np.ix_(lat_m, lon_m)] if v is not None else None

            out = (OUTPUT_DIR / 'ecmwf' / zone_key / param_key /
                   f'{run_date}_{run_hour:02d}h' / f'H+{step:03d}.png')
            generate_map(lats_2d, lons_2d, data_c, param_key, zone_key, out,
                         'ecmwf', run_date, run_hour, step, u_c, v_c, is_static=False)
            
            out_static = (OUTPUT_DIR / 'ecmwf' / zone_key / param_key /
                          f'{run_date}_{run_hour:02d}h' / f'H+{step:03d}_static.png')
            generate_map(lats_2d, lons_2d, data_c, param_key, zone_key, out_static,
                         'ecmwf', run_date, run_hour, step, u_c, v_c, is_static=True)
            total += 2
    return total


def process_icon_step(step, run_dir, run_date, run_hour):
    """Génère les cartes ICON-EU pour un pas de temps donné."""
    import xarray as xr
    import numpy as np
    run_dir = Path(run_dir)
    total = 0
    
    for param_key in ACTIVE_PARAMETERS:
        ip   = PARAMETERS[param_key].get('icon_param')
        conv = PARAMETERS[param_key]['convert_icon']
        if not ip:
            continue
        try:
            u_data = v_data = None
            if isinstance(ip, list):
                f_u = run_dir / f'{ip[0]}_{step:03d}.grib2'
                f_v = run_dir / f'{ip[1]}_{step:03d}.grib2'
                if not f_u.exists() or not f_v.exists():
                    continue
                ds_u = xr.open_dataset(str(f_u), engine='cfgrib')
                ds_v = xr.open_dataset(str(f_v), engine='cfgrib')
                u_raw  = ds_u[list(ds_u.data_vars)[0]].values
                v_raw  = ds_v[list(ds_v.data_vars)[0]].values
                lats   = ds_u.latitude.values
                lons   = ds_u.longitude.values
                data   = conv(u_raw, v_raw)
                u_data = u_raw
                v_data = v_raw
            else:
                f = run_dir / f'{ip}_{step:03d}.grib2'
                if not f.exists():
                    continue
                ds   = xr.open_dataset(str(f), engine='cfgrib')
                var  = list(ds.data_vars)[0]
                lats = ds.latitude.values
                lons = ds.longitude.values
                data = conv(ds[var].values)

            data = np.where(np.isfinite(data), data, np.nan)

            for zone_key in ACTIVE_ZONES:
                zone = ZONES[zone_key]
                lon_min, lon_max, lat_min, lat_max = zone['bounds']
                lon_m = (lons >= lon_min) & (lons <= lon_max)
                lat_m = (lats >= lat_min) & (lats <= lat_max)
                if not lon_m.any() or not lat_m.any():
                    continue
                lats_c   = lats[lat_m]
                lons_c   = lons[lon_m]
                data_c   = data[np.ix_(lat_m, lon_m)]
                lons_2d, lats_2d = np.meshgrid(lons_c, lats_c)
                u_c = u_data[np.ix_(lat_m, lon_m)] if u_data is not None else None
                v_c = v_data[np.ix_(lat_m, lon_m)] if v_data is not None else None

                out = (OUTPUT_DIR / 'icon-eu' / zone_key / param_key /
                       f'{run_date}_{run_hour:02d}h' / f'H+{step:03d}.png')
                generate_map(lats_2d, lons_2d, data_c, param_key, zone_key, out,
                             'icon-eu', run_date, run_hour, step, u_c, v_c, is_static=False)
                
                out_static = (OUTPUT_DIR / 'icon-eu' / zone_key / param_key /
                              f'{run_date}_{run_hour:02d}h' / f'H+{step:03d}_static.png')
                generate_map(lats_2d, lons_2d, data_c, param_key, zone_key, out_static,
                             'icon-eu', run_date, run_hour, step, u_c, v_c, is_static=True)
                total += 2
        except Exception as e:
            log.warning(f"  {param_key} H+{step:03d} : {e}")
            continue
    return total


def process_arome_step(step, run_dir, run_date, run_hour):
    """Génère les cartes AROME pour un pas de temps donné."""
    import xarray as xr
    import numpy as np
    run_dir = Path(run_dir)
    total = 0

    AROME_FILE = {
        'temperature': ('{param_key}_{step:03d}.grib2', None),
        'wind_speed':  ('{param_key}_U_{step:03d}.grib2', '{param_key}_V_{step:03d}.grib2'),
        'wind_gusts':  ('{param_key}_{step:03d}.grib2', None),
        'precipitation': ('{param_key}_{step:03d}.grib2', None),
        'pressure':    ('{param_key}_{step:03d}.grib2', None),
        'clouds':      ('{param_key}_{step:03d}.grib2', None),
        'humidity':    ('{param_key}_{step:03d}.grib2', None),
        'cape':        ('{param_key}_{step:03d}.grib2', None),
        'snow':        ('{param_key}_{step:03d}.grib2', None),
    }

    for param_key in ACTIVE_PARAMETERS:
        conv = PARAMETERS[param_key].get('convert_icon', lambda x: x)
        file_tpl = AROME_FILE.get(param_key)
        if not file_tpl:
            continue
        try:
            u_data = v_data = None
            fname_u, fname_v = file_tpl
            fname_u = fname_u.format(param_key=param_key, step=step)

            if fname_v:
                fname_v = fname_v.format(param_key=param_key, step=step)
                f_u = run_dir / fname_u
                f_v = run_dir / fname_v
                if not f_u.exists() or not f_v.exists():
                    continue
                ds_u = xr.open_dataset(str(f_u), engine='cfgrib')
                ds_v = xr.open_dataset(str(f_v), engine='cfgrib')
                u_raw = ds_u[list(ds_u.data_vars)[0]].values
                v_raw = ds_v[list(ds_v.data_vars)[0]].values
                lats  = ds_u.latitude.values
                lons  = ds_u.longitude.values
                data  = conv(u_raw, v_raw)
                u_data = u_raw
                v_data = v_raw
            else:
                f = run_dir / fname_u
                if not f.exists():
                    continue
                ds   = xr.open_dataset(str(f), engine='cfgrib')
                var  = list(ds.data_vars)[0]
                lats = ds.latitude.values
                lons = ds.longitude.values
                data = conv(ds[var].values)

            data = np.where(np.isfinite(data), data, np.nan)

            for zone_key in ACTIVE_ZONES:
                zone = ZONES[zone_key]
                lon_min, lon_max, lat_min, lat_max = zone['bounds']
                lon_m = (lons >= lon_min) & (lons <= lon_max)
                lat_m = (lats >= lat_min) & (lats <= lat_max)
                if not lon_m.any() or not lat_m.any():
                    continue
                lats_c = lats[lat_m]
                lons_c = lons[lon_m]
                data_c = data[np.ix_(lat_m, lon_m)]
                lons_2d, lats_2d = np.meshgrid(lons_c, lats_c)
                u_c = u_data[np.ix_(lat_m, lon_m)] if u_data is not None else None
                v_c = v_data[np.ix_(lat_m, lon_m)] if v_data is not None else None

                out = (OUTPUT_DIR / 'arome' / zone_key / param_key /
                       f'{run_date}_{run_hour:02d}h' / f'H+{step:03d}.png')
                generate_map(lats_2d, lons_2d, data_c, param_key, zone_key, out,
                             'arome', run_date, run_hour, step, u_c, v_c, is_static=False)
                
                out_static = (OUTPUT_DIR / 'arome' / zone_key / param_key /
                              f'{run_date}_{run_hour:02d}h' / f'H+{step:03d}_static.png')
                generate_map(lats_2d, lons_2d, data_c, param_key, zone_key, out_static,
                             'arome', run_date, run_hour, step, u_c, v_c, is_static=True)
                total += 2

        except Exception as e:
            log.warning(f"  {param_key} H+{step:03d} : {e}")
            continue
    return total


# ─── ORCHESTRATION DU TRAITEMENT DES MODÈLES ────────────────────────────────────

def process_ecmwf(grib_file, run_date, run_hour):
    from concurrent.futures import ProcessPoolExecutor
    import os
    steps = MODELS['ecmwf']['steps']
    total = 0
    max_workers = os.cpu_count() or 2
    log.info(f"Début traitement parallèle ECMWF sur {max_workers} cœurs ({len(steps)} pas)")

    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        futures = [
            executor.submit(process_ecmwf_step, step, grib_file, run_date, run_hour)
            for step in steps
        ]
        for fut in futures:
            try:
                total += fut.result()
            except Exception as e:
                log.error(f"Erreur pas de temps ECMWF : {e}")

    log.info(f"✅ ECMWF : {total} cartes générées en parallèle")
    return total


def process_icon(run_dir, run_date, run_hour):
    from concurrent.futures import ProcessPoolExecutor
    import os
    steps = MODELS['icon-eu']['steps']
    total = 0
    max_workers = os.cpu_count() or 2
    log.info(f"Début traitement parallèle ICON-EU sur {max_workers} cœurs ({len(steps)} pas)")

    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        futures = [
            executor.submit(process_icon_step, step, run_dir, run_date, run_hour)
            for step in steps
        ]
        for fut in futures:
            try:
                total += fut.result()
            except Exception as e:
                log.error(f"Erreur pas de temps ICON-EU : {e}")

    log.info(f"✅ ICON-EU : {total} cartes générées en parallèle")
    return total


def process_arome(run_dir, run_date, run_hour):
    from concurrent.futures import ProcessPoolExecutor
    import os
    steps = MODELS['arome']['steps']
    total = 0
    max_workers = os.cpu_count() or 2
    log.info(f"Début traitement parallèle AROME sur {max_workers} cœurs ({len(steps)} pas)")

    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        futures = [
            executor.submit(process_arome_step, step, run_dir, run_date, run_hour)
            for step in steps
        ]
        for fut in futures:
            try:
                total += fut.result()
            except Exception as e:
                log.error(f"Erreur pas de temps AROME : {e}")

    log.info(f"✅ AROME : {total} cartes générées en parallèle")
    return total


if __name__ == '__main__':
    mode     = sys.argv[1] if len(sys.argv) > 1 else 'icon'
    grib_arg = sys.argv[2] if len(sys.argv) > 2 else ''
    run_date = sys.argv[3] if len(sys.argv) > 3 else '20260529'
    run_hour = int(sys.argv[4]) if len(sys.argv) > 4 else 0
    if mode == 'ecmwf':
        process_ecmwf(grib_arg, run_date, run_hour)
    elif mode == 'arome':
        process_arome(grib_arg, run_date, run_hour)
    else:
        process_icon(grib_arg, run_date, run_hour)


