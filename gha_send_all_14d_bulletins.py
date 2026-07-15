# -*- coding: utf-8 -*-
"""
gha_send_all_14d_bulletins.py
Script de pilotage automatique pour générer les 32 bulletins météo (14 jours régionales et 5 jours Patrick).
Conçu spécialement pour s'exécuter sous GitHub Actions ou localement.
"""
import os
import sys
import subprocess
import smtplib
import base64
import uuid
import datetime
import zipfile
import unicodedata
from email.utils import formatdate

# Liste des 14 zones géographiques (National + 13 Régions métropolitaines)
ZONES = [
    "france_pictos", "hdf", "normandie", "idf", "grandest", "ara", 
    "naq", "occitanie", "paca", "bfc", "bretagne", "pdl", "cvl", "corse"
]

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
    
    # Nettoyage ASCII du sujet
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
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=45) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(gmail_email, gmail_password)
            server.sendmail(gmail_email, recipients, raw_message.encode('ascii'))
        print("[SMTP] E-mail envoyé avec succès !")
        return True
    except Exception as e:
        print(f"[SMTP] Erreur d'envoi du mail : {e}")
        return False

def run_command(cmd, cwd):
    print(f"-> Exécution : {' '.join(cmd)}")
    try:
        res = subprocess.run(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode != 0:
            print(f"❌ Échec de la commande (code {res.returncode}) : {res.stderr}")
            return False
        return True
    except Exception as e:
        print(f"❌ Exception lors de l'exécution : {e}")
        return False

def main():
    scripts_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Résolution dynamique des dossiers cartes_alertes
    if os.environ.get("GITHUB_ACTIONS"):
        project_root = os.path.abspath(os.path.join(scripts_dir, ".."))
        cartes_dir = os.path.join(project_root, "cartes_alertes")
    else:
        cartes_dir = os.path.expanduser(r"~\Desktop\cartes_alertes")
        
    os.makedirs(cartes_dir, exist_ok=True)
    
    print("==================================================")
    print("   GÉNÉRATION DES 32 BULLETINS VIDÉO (14 JOURS)  ")
    print("==================================================")
    
    video_files_to_zip = []
    
    # --- PARTIE 1 : Bulletins Standards (14 jours - 14 zones) ---
    print("\n--- Phase 1 : 28 bulletins régionaux et nationaux standards ---")
    for zone in ZONES:
        print(f"\n🌍 Traitement de la zone : {zone}...")
        
        # 1. Génération des cartes 14 jours (Paysage)
        run_command(["python", "generate_meteofrance_maps.py", "--zone", zone, "--days", "14", "--orientation", "landscape"], scripts_dir)
        # 2. Vidéo Paysage
        if run_command(["python", "generate_video_bulletin.py", "--zone", zone, "--days", "14", "--orientation", "landscape", "--skip-maps"], scripts_dir):
            video_files_to_zip.append(f"bulletin_{zone}_landscape.mp4")
            
        # 3. Génération des cartes 14 jours (Portrait)
        run_command(["python", "generate_meteofrance_maps.py", "--zone", zone, "--days", "14", "--orientation", "portrait"], scripts_dir)
        # 4. Vidéo Portrait
        if run_command(["python", "generate_video_bulletin.py", "--zone", zone, "--days", "14", "--orientation", "portrait", "--skip-maps"], scripts_dir):
            video_files_to_zip.append(f"bulletin_{zone}_portrait.mp4")

    # --- PARTIE 2 : Bulletins Spécifiques Patrick (5 jours - 2 zones) ---
    print("\n--- Phase 2 : 4 bulletins spécifiques Patrick (5 jours) ---")
    patrick_zones = ["france_pictos", "hdf"]
    for zone in patrick_zones:
        print(f"\n👴 Traitement zone Patrick : {zone}...")
        
        # 1. Cartes Patrick Paysage
        run_command(["python", "generate_meteofrance_maps.py", "--zone", zone, "--days", "5", "--orientation", "landscape", "--patrick", "--temp-highlight"], scripts_dir)
        # 2. Vidéo Patrick Paysage
        if run_command(["python", "generate_video_bulletin.py", "--zone", zone, "--days", "5", "--orientation", "landscape", "--patrick", "--skip-maps"], scripts_dir):
            video_files_to_zip.append(f"bulletin_{zone}_patrick_landscape.mp4")
            
        # 3. Cartes Patrick Portrait
        run_command(["python", "generate_meteofrance_maps.py", "--zone", zone, "--days", "5", "--orientation", "portrait", "--patrick", "--temp-highlight"], scripts_dir)
        # 4. Vidéo Patrick Portrait
        if run_command(["python", "generate_video_bulletin.py", "--zone", zone, "--days", "5", "--orientation", "portrait", "--patrick", "--skip-maps"], scripts_dir):
            video_files_to_zip.append(f"bulletin_{zone}_patrick_portrait.mp4")

    # --- PARTIE 3 : Compression ZIP de tous les bulletins ---
    print("\n--- Phase 3 : Compression ZIP des 32 vidéos ---")
    zip_name = "bulletins_complets_14j.zip"
    zip_path = os.path.join(cartes_dir, zip_name)
    
    try:
        if os.path.exists(zip_path):
            os.remove(zip_path)
            
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            for v_file in video_files_to_zip:
                v_path = os.path.join(cartes_dir, v_file)
                if os.path.exists(v_path):
                    zipf.write(v_path, arcname=v_file)
                    print(f"  -> Ajouté au ZIP : {v_file}")
                else:
                    print(f"  -> ⚠️ Fichier manquant : {v_file}")
        print("Archive ZIP créée avec succès.")
    except Exception as e:
        print(f"Erreur lors de la compression ZIP : {e}")
        sys.exit(1)
        
    # --- PARTIE 4 : Envoi de l'e-mail ---
    download_url = f"https://github.com/monsieurmeteo/europe-1-v2/releases/download/bulletins-14j-latest/{zip_name}"
    tomorrow = datetime.date.today() + datetime.timedelta(days=1)
    
    email_body = (
        f"<html><body style='font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; color: #333; line-height: 1.6;'>"
        f"Bonjour,<br><br>"
        f"L'intégralité des 32 bulletins vidéo (prévisions régionales et nationales à 14 jours, et bulletins Patrick à 5 jours) pour demain (<strong>{get_french_date_string(tomorrow)}</strong>) a été générée et compilée avec succès.<br><br>"
        f"👉 <a href='{download_url}' style='color: #1a73e8; font-weight: bold; text-decoration: underline;'>Cliquer sur ce lien pour télécharger le pack ZIP complet des 32 vidéos</a><br><br>"
        f"Cordialement,<br>"
        f"L'automatisation Météo CNews"
        f"</body></html>"
    )
    
    subject = f"Bulletins video complets (32 fichiers) du {get_french_date_string(tomorrow)}"
    
    # Mode Test / Prod
    test_mode = os.environ.get("TEST_MODE", "false").lower() in ["true", "1", "yes"]
    if len(sys.argv) > 1 and sys.argv[1] == "--test-mode":
        test_mode = True
        
    if test_mode:
        recipients = "gregory.langlet@sfr.fr, langlet.gregory@gmail.com"
        print("[MODE TEST] E-mail envoyé uniquement à Grégory.")
    else:
        recipients = "gregory.langlet@sfr.fr, langlet.gregory@gmail.com, patrick.marliere@wanadoo.fr"
        print("[MODE PROD] E-mail envoyé à Grégory et Patrick.")
        
    send_email(email_body, subject, recipients)
    print("Génération et envoi du pack complet de bulletins terminés avec succès !")

if __name__ == "__main__":
    main()
