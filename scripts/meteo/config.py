"""
Configuration centrale du pipeline modèles météo.
Zones, paramètres, pas de temps par modèle.
"""
import os

# ─── ZONES GÉOGRAPHIQUES ───────────────────────────────────────────────────────
# bounds = [lon_min, lon_max, lat_min, lat_max]
ZONES = {
    'france': {
        'name': 'France',
        'bounds': [-6, 11, 41, 52.5],
        'figsize': (10, 8),
        'dpi': 120,
    },
    'hauts-de-france': {
        'name': 'Hauts-de-France',
        'bounds': [0.0, 5.2, 48.2, 51.5],
        'figsize': (10, 7),
        'dpi': 150,
    },
}

ACTIVE_ZONES = ['france', 'hauts-de-france']

# ─── PARAMÈTRES MÉTÉO ──────────────────────────────────────────────────────────
PARAMETERS = {
    'temperature': {
        'label': 'Température 2m',
        'unit': '°C',
        'icon': '🌡️',
        'ecmwf_param': '2t',
        'icon_param': 'T_2M',
        'convert_ecmwf': lambda x: x - 273.15,
        'convert_icon':  lambda x: x - 273.15,
        'levels': list(range(-30, 46, 1)),
        'cmap': 'temp',
        'extend': 'both',
        'isobars': False,
    },
    'wind_speed': {
        'label': 'Vent 10m',
        'unit': 'km/h',
        'icon': '💨',
        'ecmwf_param': ['10u', '10v'],
        'icon_param': ['U_10M', 'V_10M'],
        'convert_ecmwf': lambda u, v: ((u**2 + v**2)**0.5) * 3.6,
        'convert_icon':  lambda u, v: ((u**2 + v**2)**0.5) * 3.6,
        'levels': [0,5,10,15,20,25,30,40,50,60,70,80,90,100,120,150,200],
        'cmap': 'wind',
        'extend': 'max',
        'wind_arrows': True,
        'isobars': False,
    },
    'wind_gusts': {
        'label': 'Rafales 10m',
        'unit': 'km/h',
        'icon': '🌬️',
        'ecmwf_param': '10fg',
        'icon_param': 'VMAX_10M',
        'convert_ecmwf': lambda x: x * 3.6,
        'convert_icon':  lambda x: x * 3.6,
        'levels': [0,10,20,30,40,50,60,70,80,90,100,110,120,140,160,200],
        'cmap': 'wind',
        'extend': 'max',
        'isobars': False,
    },
    'precipitation': {
        'label': 'Précipitations',
        'unit': 'mm',
        'icon': '🌧️',
        'ecmwf_param': 'tp',
        'icon_param': 'TOT_PREC',
        'convert_ecmwf': lambda x: x * 1000,   # m → mm
        'convert_icon':  lambda x: x,            # déjà en mm
        'levels': [0.1, 0.5, 1, 2, 3, 5, 7, 10, 15, 20, 30, 40, 50, 75, 100],
        'cmap': 'precip',
        'extend': 'max',
        'isobars': False,
    },
    'pressure': {
        'label': 'Pression mer',
        'unit': 'hPa',
        'icon': '📊',
        'ecmwf_param': 'msl',
        'icon_param': 'PMSL',
        'convert_ecmwf': lambda x: x / 100,
        'convert_icon':  lambda x: x / 100,
        'levels': list(range(940, 1042, 2)),
        'cmap': 'pressure',
        'extend': 'both',
        'isobars': True,
        'isobar_step': 5,
    },
    'geopotential': {
        'label': 'Géopotentiel 500 hPa',
        'unit': 'mgp',
        'icon': '🌀',
        'ecmwf_param': 'z',           # geopotential m²/s²
        'ecmwf_levtype': 'pl',        # pressure levels
        'ecmwf_level': 500,
        'icon_param': 'FI',
        'convert_ecmwf': lambda x: x / 9.80665,   # m²/s² → mgp
        'convert_icon':  lambda x: x / 9.80665,
        # Niveaux typiques 500hPa : 5200–5900 mgp
        'levels': list(range(4800, 5960, 40)),
        'cmap': 'geopotential',
        'extend': 'both',
        'isobars': True,
        'isobar_step': 40,
        'isobar_label': True,
    },
    'clouds': {
        'label': 'Nébulosité totale',
        'unit': '%',
        'icon': '☁️',
        'ecmwf_param': 'tcc',
        'icon_param': 'CLCT',
        'convert_ecmwf': lambda x: x * 100,
        'convert_icon':  lambda x: x,
        'levels': list(range(0, 101, 5)),
        'cmap': 'clouds',
        'extend': 'neither',
        'isobars': False,
        'animation': True,   # marqué pour animation dédiée
    },
    'cape': {
        'label': 'CAPE',
        'unit': 'J/kg',
        'icon': '⚡',
        'ecmwf_param': 'cape',
        'icon_param': 'CAPE_CON',
        'convert_ecmwf': lambda x: x,
        'convert_icon':  lambda x: x,
        'levels': [0,50,100,200,300,500,750,1000,1500,2000,2500,3000,4000,5000],
        'cmap': 'cape',
        'extend': 'max',
        'isobars': False,
    },
    'humidity': {
        'label': 'Humidité 2m',
        'unit': '%',
        'icon': '💧',
        'ecmwf_param': '2d',
        'icon_param': 'RELHUM_2M',
        'convert_ecmwf': lambda x: x,
        'convert_icon':  lambda x: x,
        'levels': list(range(0, 101, 5)),
        'cmap': 'humidity',
        'extend': 'neither',
        'isobars': False,
    },
    'snow': {
        'label': 'Épaisseur neige',
        'unit': 'cm',
        'icon': '❄️',
        'ecmwf_param': 'sd',
        'icon_param': 'H_SNOW',
        'convert_ecmwf': lambda x: x * 100,
        'convert_icon':  lambda x: x * 100,
        'levels': [0,1,2,5,10,20,30,50,75,100,150,200],
        'cmap': 'snow',
        'extend': 'max',
        'isobars': False,
    },
}

ACTIVE_PARAMETERS = [
    'temperature', 'wind_speed', 'wind_gusts', 'precipitation',
    'pressure', 'geopotential', 'clouds', 'cape', 'humidity', 'snow'
]

# ─── MODÈLES ET LEURS PAS DE TEMPS ────────────────────────────────────────────
MODELS = {
    'ecmwf': {
        'name': 'ECMWF IFS',
        'short': 'ECMWF',
        'resolution': '~28 km',
        'color': '#2563eb',
        # Limité à 0 pour test 3h (ECMWF n'a que des pas de 6h)
        'steps': [0],
        'runs': [0, 12],
        'enabled': False,
        'delay_h': 7,   # disponible ~7h après le run
    },
    'icon-eu': {
        'name': 'ICON-EU (DWD)',
        'short': 'ICON-EU',
        'resolution': '6.5 km',
        'color': '#16a34a',
        # Toutes les heures H+000→H+120, puis pas de 3h H+123→H+180
        'steps': list(range(0, 121, 1)) + list(range(123, 181, 3)),
        'runs': [0, 3, 6, 9, 12, 15, 18, 21],
        'enabled': True,
        'delay_h': 3,
    },
    'arome': {
        'name': 'AROME (Météo-France)',
        'short': 'AROME',
        'resolution': '1.3 km',
        'color': '#dc2626',
        'steps': list(range(0, 52, 1)),
        'runs': [0, 3, 6, 9, 12, 15, 18, 21],
        'enabled': False,
        'delay_h': 2,
    },
    'arpege': {
        'name': 'ARPÈGE (Météo-France)',
        'short': 'ARPÈGE',
        'resolution': '~10 km',
        'color': '#9333ea',
        'steps': list(range(0, 103, 1)) + list(range(105, 115, 3)),
        'runs': [0, 6, 12, 18],
        'enabled': False,   # activer après clé API MF
        'delay_h': 4,
    },
}

# ─── FILTRAGE DES PAS DE TEMPS (POUR MATRIX WORKFLOWS) ─────────────────────────
import os
env_steps = os.environ.get('METEO_STEPS')
if env_steps:
    try:
        if '-' in env_steps:
            start, end = map(int, env_steps.split('-'))
            for m_key in MODELS:
                MODELS[m_key]['steps'] = [s for s in MODELS[m_key]['steps'] if start <= s <= end]
        else:
            allowed = set(map(int, env_steps.split(',')))
            for m_key in MODELS:
                MODELS[m_key]['steps'] = [s for s in MODELS[m_key]['steps'] if s in allowed]
    except Exception as e:
        print(f"WARNING: failed to parse METEO_STEPS env variable '{env_steps}': {e}")


# ─── CHEMINS SUPABASE STORAGE ──────────────────────────────────────────────────
BUCKET_NAME = 'meteo-models'

def storage_path(model, zone, parameter, run_date, run_hour, step):
    """Chemin Supabase : model/zone/param/YYYYMMDD_HHh/H+FFF.png"""
    return f'{model}/{zone}/{parameter}/{run_date}_{run_hour:02d}h/H+{step:03d}.png'

def metadata_path():
    return 'metadata.json'

# ─── SUPABASE ──────────────────────────────────────────────────────────────────
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')

# ─── ARCHIVE : garder 48h ──────────────────────────────────────────────────────
ARCHIVE_HOURS = 48
