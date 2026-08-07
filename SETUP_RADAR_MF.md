# Configuration du Radar Météo-France Automatisé

## Architecture

```
Scripts Python (local ou GitHub Actions)
    ↓ Toutes les 5 minutes
    ↓ Télécharge HDF5 depuis API Météo-France
    ↓ Convertit en PNG avec palette officielle
    ↓
Supabase Storage (bucket: radar-mf)
    ↓ Images PNG + manifest.json
    ↓ URLs publiques
    ↓
Frontend React (RadarFrance.jsx / SupervisionMap.jsx)
    ↓ Lit manifest.json depuis Supabase Storage
    ↓ Affiche les images avec Leaflet ImageOverlay
```

## Étapes de configuration

### 1. Récupérer la clé service_role Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet `ubdevaemtwbzxksjlhjg`
3. Allez dans **Settings** → **API**
4. Copiez la clé **service_role** (commence par `eyJ...`)
5. Ajoutez-la dans `.env.local` :

```env
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...votre_cle...
```

### 2. Tester le script en local

```powershell
python scripts/fetch_radar_supabase.py
```

Le script va :
- Détecter la clé service_role dans .env.local
- Créer le bucket `radar-mf` dans Supabase Storage (si nécessaire)
- Télécharger les données radar Météo-France
- Convertir les HDF5 en PNG
- Uploader les PNG + manifest.json dans Supabase Storage
- Nettoyer les anciennes frames (garde les 24 dernières = 2h)

### 3. Configurer GitHub Actions (cron automatique)

Ajoutez les secrets dans votre repo GitHub :
- **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Secrets à ajouter :
| Nom | Valeur |
|-----|--------|
| `MF_RADAR_API_KEY` | La clé API Météo-France (dans fetch_radar_mf.py) |
| `SUPABASE_URL` | `https://ubdevaemtwbzxksjlhjg.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | La clé service_role Supabase |

Le workflow `.github/workflows/radar-refresh.yml` s'exécutera automatiquement toutes les 5 minutes.

### 4. Lancement local automatique (optionnel)

Si vous préférez garder le script en local :

```powershell
# Tourne en boucle toutes les 5 minutes
python scripts/radar_auto_refresh.py
```

Ou créer une tâche planifiée Windows :
```powershell
$action = New-ScheduledTaskAction -Execute "python" -Argument "scripts/fetch_radar_supabase.py" -WorkingDirectory "C:\Users\grego\Documents\minisite-douai"
$trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 5) -At "00:00" -Daily
Register-ScheduledTask -TaskName "RadarMF" -Action $action -Trigger $trigger -RunLevel Highest
```

## Fichiers impliqués

| Fichier | Rôle |
|---------|------|
| `scripts/fetch_radar_supabase.py` | Script principal (upload Supabase) |
| `scripts/fetch_radar_mf.py` | Script legacy (local uniquement) |
| `scripts/radar_auto_refresh.py` | Boucle auto (local) |
| `.github/workflows/radar-refresh.yml` | Cron GitHub Actions |
| `src/modules/radar/RadarFrance.jsx` | Frontend radar |
| `src/modules/supervision/SupervisionMap.jsx` | Frontend supervision |
