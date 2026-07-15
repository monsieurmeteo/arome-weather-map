import os
import sys
import subprocess
import argparse
import datetime
import time
from multiprocessing import Pool

GROUPS = [
    "france_pictos",
    "hdf",
    "normandie",
    "idf",
    "grandest",
    "ara",
    "naq",
    "occitanie",
    "paca",
    "bfc",
    "bretagne",
    "pdl",
    "cvl",
    "corse",
    "cnews",
    "france"
]

def log(msg):
    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {msg}")

def run_cmd(cmd, cwd=None):
    try:
        res = subprocess.run(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode != 0:
            log(f"ERREUR (code {res.returncode}) pour : {' '.join(cmd)}")
            log(f"Stdout : {res.stdout}")
            log(f"Stderr : {res.stderr}")
            return False
        return True
    except Exception as e:
        log(f"Exception lors de l'execution de {' '.join(cmd)} : {e}")
        return False

def generate_group_bulletins(args_tuple):
    group, days, patrick, skip_maps, script_dir = args_tuple
    log(f"--- Debut generation pour le groupe : {group} ---")
    
    # 1. Orientation Landscape (TV)
    if not skip_maps:
        cmd_map_land = ["python", "generate_meteofrance_maps.py", "--zone", group, "--days", str(days), "--orientation", "landscape"]
        if patrick:
            cmd_map_land.append("--patrick")
            cmd_map_land.append("--temp-highlight")
        log(f"[{group}] Generation cartes paysage...")
        if not run_cmd(cmd_map_land, script_dir):
            return group, False
            
    cmd_vid_land = ["python", "generate_video_bulletin.py", "--zone", group, "--days", str(days), "--orientation", "landscape", "--skip-maps"]
    if patrick:
        cmd_vid_land.append("--patrick")
    log(f"[{group}] Compilation video paysage...")
    if not run_cmd(cmd_vid_land, script_dir):
        return group, False

    # 2. Orientation Portrait (TikTok)
    if not skip_maps:
        cmd_map_port = ["python", "generate_meteofrance_maps.py", "--zone", group, "--days", str(days), "--orientation", "portrait"]
        if patrick:
            cmd_map_port.append("--patrick")
            cmd_map_port.append("--temp-highlight")
        log(f"[{group}] Generation cartes portrait...")
        if not run_cmd(cmd_map_port, script_dir):
            return group, False
            
    cmd_vid_port = ["python", "generate_video_bulletin.py", "--zone", group, "--days", str(days), "--orientation", "portrait", "--skip-maps"]
    if patrick:
        cmd_vid_port.append("--patrick")
    log(f"[{group}] Compilation video portrait...")
    if not run_cmd(cmd_vid_port, script_dir):
        return group, False
        
    log(f"--- Fin generation avec succes pour le groupe : {group} ---")
    return group, True

def get_video_duration(file_path):
    cmd = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        file_path
    ]
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode == 0 and res.stdout.strip():
            return float(res.stdout.strip())
    except Exception as e:
        log(f"Avertissement lors de la lecture de la duree (ffprobe) pour {os.path.basename(file_path)} : {e}")
    return 0.0

def verify_all_bulletins(groups, patrick, cartes_dir):
    log("=== DEBUT DE L'AUTO-VERIFICATION FINALE ===")
    tomorrow = datetime.date.today() + datetime.timedelta(days=1)
    date_suffix = tomorrow.strftime("%Y_%m_%d")
    
    missing_or_corrupt = []
    
    for group in groups:
        for orient in ["landscape", "portrait"]:
            # Construction du nom de fichier attendu
            if patrick:
                filename = f"bulletin_{group}_patrick_{orient}_{date_suffix}.mp4"
            else:
                filename = f"bulletin_{group}_{orient}.mp4"
                
            file_path = os.path.join(cartes_dir, filename)
            
            # 1. Verification de l'existence
            if not os.path.exists(file_path):
                log(f"❌ VIDEO MANQUANTE : {filename}")
                missing_or_corrupt.append((filename, "Fichier inexistant"))
                continue
                
            # 2. Verification de la taille
            sz = os.path.getsize(file_path)
            if sz < 1024 * 1024: # Moins de 1 Mo
                log(f"❌ FICHIER TROP PETIT : {filename} ({sz / (1024*1024):.2f} Mo)")
                missing_or_corrupt.append((filename, f"Taille invalide: {sz} octets"))
                continue
                
            # 3. Verification de la duree via ffprobe
            duration = get_video_duration(file_path)
            if duration <= 0.0:
                log(f"❌ VIDEO CORROMPUE OU DUREE NULLE : {filename}")
                missing_or_corrupt.append((filename, "Duree nulle ou ffprobe en echec"))
            else:
                log(f"✅ VALIDE : {filename} ({sz / (1024*1024):.2f} Mo, {duration:.1f}s)")
                
    if missing_or_corrupt:
        log("❌ ERREUR : L'auto-verification a detecte des anomalies sur certaines videos !")
        for f, err in missing_or_corrupt:
            log(f"  - {f} : {err}")
        return False
        
    log("🎉 TOUTES LES VIDEOS ONT ETE VERIFIEES AVEC SUCCES ! AUCUNE ANOMALIE DETECTEE.")
    return True

def main():
    parser = argparse.ArgumentParser(description="Orchestrateur Local de generation en parallele des bulletins video")
    parser.add_argument("--skip-maps", action="store_true", help="Passe l'etape de generation et execute uniquement la verif")
    parser.add_argument("--days", type=int, default=5, help="Nombre de jours de previsions (par defaut 5)")
    parser.add_argument("--no-patrick", action="store_true", help="Désactive le mode Patrick (genere des bulletins standards)")
    parser.add_argument("--groups", type=str, help="Liste de groupes a executer separes par des virgules (ex: hdf,grandest)")
    parser.add_argument("--pool-size", type=int, default=4, help="Nombre de processus simultanes en local (par defaut 4)")
    args = parser.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    cartes_dir = os.path.abspath(os.path.join(script_dir, "cartes_alertes"))
    if not os.path.exists(cartes_dir):
        cartes_dir = os.path.expanduser(r"~\Desktop\cartes_alertes")
        
    patrick = not args.no_patrick
    
    # Filtrer les groupes a executer
    active_groups = GROUPS
    if args.groups:
        active_groups = [g.strip() for g in args.groups.split(",") if g.strip()]
        
    log(f"Dossier cible des cartes et videos : {cartes_dir}")
    log(f"Groupes actifs ({len(active_groups)}) : {', '.join(active_groups)}")
    
    if not args.skip_maps:
        log(f"Lancement de la generation parallele avec un pool de {args.pool_size} processus...")
        tasks = [(g, args.days, patrick, False, script_dir) for g in active_groups]
        
        # Lancement en multiprocessing
        start_time = time.time()
        with Pool(processes=args.pool_size) as pool:
            results = pool.map(generate_group_bulletins, tasks)
        end_time = time.time()
        
        log(f"Generation parallele terminee en {end_time - start_time:.1f} secondes.")
        
        # Analyse des resultats du pool
        failed = [g for g, success in results if not success]
        if failed:
            log(f"❌ ERREUR : La generation a echoue pour les groupes suivants : {', '.join(failed)}")
            sys.exit(1)
            
    # Etape d'auto-verification
    if not verify_all_bulletins(active_groups, patrick, cartes_dir):
        sys.exit(1)
        
    log("Processus global termine avec succes.")
    sys.exit(0)

if __name__ == "__main__":
    main()
