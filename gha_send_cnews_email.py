import os
import sys
import subprocess
import smtplib
import base64
import uuid
import datetime
from email.utils import formatdate
import unicodedata

def get_french_date_string(date_obj):
    months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
    weekdays = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
    return f"{weekdays[date_obj.weekday()]} {date_obj.day} {months[date_obj.month - 1]} {date_obj.year}"

def send_email(body_text, subject, recipients_str):
    gmail_email = os.environ.get("GMAIL_EMAIL", "langlet.gregory@gmail.com")
    gmail_password = os.environ.get("GMAIL_APP_PASSWORD")
    if not gmail_password:
        print("[SMTP] ERREUR : GMAIL_APP_PASSWORD non configuré. Annulation envoi.")
        return False
        
    gmail_email = gmail_email.replace('\ufeff', '').replace('\ufffe', '').strip()
    gmail_password = gmail_password.replace('\ufeff', '').replace('\ufffe', '').strip()
    
    recipients = [r.strip() for r in recipients_str.split(",") if r.strip()]
    sender = gmail_email
    
    # Nettoyage ASCII du sujet pour éviter les rejets SMTP
    clean_subj = unicodedata.normalize('NFKD', subject).encode('ASCII', 'ignore').decode('ASCII')
    
    # Corps HTML en Base64
    body_text = body_text.replace('\ufeff', '').replace('\ufffe', '')
    text_b64 = base64.b64encode(body_text.encode('utf-8')).decode('ascii')
    
    boundary = uuid.uuid4().hex
    
    raw_message = (
        f'From: Gregory LANGLET <{sender}>\r\n'
        f'To: {", ".join(recipients)}\r\n'
        f'Subject: {clean_subj}\r\n'
        f'Date: {formatdate(localtime=True)}\r\n'
        f'MIME-Version: 1.0\r\n'
        f'Content-Type: multipart/mixed; boundary="{boundary}"\r\n'
        f'\r\n'
        f'--{boundary}\r\n'
        f'Content-Type: text/html; charset=utf-8\r\n'
        f'Content-Transfer-Encoding: base64\r\n'
        f'\r\n'
        f'{text_b64}\r\n'
        f'\r\n'
        f'--{boundary}--\r\n'
    )
    
    print(f"[SMTP] Envoi via Gmail à {', '.join(recipients)}...")
    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(gmail_email, gmail_password)
            server.sendmail(gmail_email, recipients, raw_message.encode('ascii'))
        print("[SMTP] E-mail CNews envoyé avec succès !")
        return True
    except Exception as e:
        print(f"[SMTP] Erreur d'envoi du mail CNews : {e}")
        return False

def run_command(cmd, cwd):
    print(f"\nExécution : {' '.join(cmd)}")
    try:
        subprocess.run(cmd, cwd=cwd, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Erreur lors de l'exécution de la commande : {e}")
        return False

def main():
    scripts_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.abspath(os.path.join(scripts_dir, "..", ".."))
    cnews_dir = os.path.join(repo_root, "meteo_cnews_2")
    cartes_dir = os.path.join(repo_root, "cartes_alertes")
    if os.environ.get("GITHUB_ACTIONS"):
        os.makedirs(cartes_dir, exist_ok=True)
    else:
        if not os.path.exists(cartes_dir):
            cartes_dir = os.path.expanduser(r"~\Desktop\cartes_alertes")
            os.makedirs(cartes_dir, exist_ok=True)
        
    print("=== ÉTAPE 0.1a : Génération cartes France paysage ===")
    cmd_maps_france_land = ["python", "generate_meteofrance_maps.py", "--zone", "france_pictos", "--days", "5", "--orientation", "landscape", "--patrick", "--temp-highlight"]
    if not run_command(cmd_maps_france_land, cnews_dir):
        sys.exit(1)

    print("=== ÉTAPE 0.1b : Génération cartes France portrait (TikTok) ===")
    cmd_maps_france_port = ["python", "generate_meteofrance_maps.py", "--zone", "france_pictos", "--days", "5", "--orientation", "portrait", "--patrick", "--temp-highlight"]
    if not run_command(cmd_maps_france_port, cnews_dir):
        sys.exit(1)

    print("=== ÉTAPE 0.2a : Génération cartes Hauts-de-France paysage ===")
    cmd_maps_hdf_land = ["python", "generate_meteofrance_maps.py", "--zone", "hdf", "--days", "5", "--orientation", "landscape", "--patrick", "--temp-highlight"]
    if not run_command(cmd_maps_hdf_land, cnews_dir):
        sys.exit(1)

    print("=== ÉTAPE 0.2b : Génération cartes Hauts-de-France portrait (TikTok) ===")
    cmd_maps_hdf_port = ["python", "generate_meteofrance_maps.py", "--zone", "hdf", "--days", "5", "--orientation", "portrait", "--patrick", "--temp-highlight"]
    if not run_command(cmd_maps_hdf_port, cnews_dir):
        sys.exit(1)

    print("=== ÉTAPE 1 : Génération en parallèle des 4 vidéos du Pack Patrick CNews ===")
    
    cmds = [
        # France Paysage
        ["python", "generate_video_bulletin.py", "--zone", "france_pictos", "--days", "5", "--orientation", "landscape", "--patrick", "--skip-maps"],
        # France Portrait (TikTok)
        ["python", "generate_video_bulletin.py", "--zone", "france_pictos", "--days", "5", "--orientation", "portrait", "--patrick", "--skip-maps"],
        # Hauts-de-France Paysage
        ["python", "generate_video_bulletin.py", "--zone", "hdf", "--days", "5", "--orientation", "landscape", "--patrick", "--skip-maps"],
        # Hauts-de-France Portrait (TikTok)
        ["python", "generate_video_bulletin.py", "--zone", "hdf", "--days", "5", "--orientation", "portrait", "--patrick", "--skip-maps"]
    ]
    
    processes = []
    for cmd in cmds:
        p = subprocess.Popen(cmd, cwd=cnews_dir)
        processes.append((cmd, p))
        
    success = True
    for cmd, p in processes:
        exit_code = p.wait()
        if exit_code != 0:
            print(f"Erreur lors de la génération de la vidéo : {' '.join(cmd)}")
            success = False
            
    if not success:
        sys.exit(1)
        
    print("\n=== ÉTAPE 2 : Compression ZIP des 4 vidéos ===")
    zip_name = "bulletins_cnews_patrick.zip"
    zip_path = os.path.join(cartes_dir, zip_name)
    
    video_files = [
        "bulletin_france_pictos_patrick_landscape.mp4",
        "bulletin_france_pictos_patrick_portrait.mp4",
        "bulletin_hdf_patrick_landscape.mp4",
        "bulletin_hdf_patrick_portrait.mp4"
    ]
    
    import zipfile
    print(f"Création de l'archive {zip_path}...")
    try:
        # Supprimer l'ancien ZIP s'il existe
        if os.path.exists(zip_path):
            os.remove(zip_path)
            
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            for v_file in video_files:
                v_path = os.path.join(cartes_dir, v_file)
                if os.path.exists(v_path):
                    zipf.write(v_path, arcname=v_file)
                    print(f"  -> Ajouté au ZIP : {v_file}")
                else:
                    print(f"  -> Avertissement : fichier {v_file} introuvable à {v_path}")
        print("Archive ZIP créée avec succès.")
    except Exception as e:
        print(f"Erreur lors de la compression ZIP : {e}")
        sys.exit(1)
        
    # Génération du lien de téléchargement (GitHub Releases — pas de limite de taille)
    download_url = f"https://github.com/gregorylanglet59264-byte/meteo-kappa/releases/download/bulletins-patrick-latest/{zip_name}"
    
    # Calcul de la date du lendemain
    tomorrow = datetime.date.today() + datetime.timedelta(days=1)
    
    # Corps HTML de l'e-mail avec style épuré et bouton/lien masqué
    email_body = (
        f"<html><body style='font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; color: #333; line-height: 1.6;'>"
        f"Bonjour,<br><br>"
        f"Veuillez trouver ci-joint vos bulletins vidéo, veuillez cliquer sur le lien ci-dessous.<br><br>"
        f"👉 <a href='{download_url}' style='color: #1a73e8; font-weight: bold; text-decoration: underline;'>Cliquer sur le lien pour télécharger vos fichiers</a><br><br>"
        f"Cordialement,<br>"
        f"L'automatisation Météo CNews"
        f"</body></html>"
    )
        
    print("\n=== ÉTAPE 3 : Envoi de l'e-mail ===")
    subject = f"bulletin vidéo du {get_french_date_string(tomorrow)}"
    
    # Gestion du mode test : si argument "test_mode" ou variable d'env GHA active
    test_mode = os.environ.get("TEST_MODE", "false").lower() in ["true", "1", "yes"]
    if len(sys.argv) > 1 and sys.argv[1] == "--test-mode":
        test_mode = True
        
    if test_mode:
        recipients = "gregory.langlet@sfr.fr, langlet.gregory@gmail.com"
        print("[MODE TEST ACTIVE] Envoi restreint à Grégory uniquement.")
    else:
        # ponytail: temporairement restreint à Grégory pour la phase de test
        recipients = "gregory.langlet@sfr.fr, langlet.gregory@gmail.com"
        print("[MODE PRODUCTION - TEMPORAIREMENT TEST] Envoi restreint à Grégory uniquement.")
        
    send_email(email_body, subject, recipients)

if __name__ == "__main__":
    main()
