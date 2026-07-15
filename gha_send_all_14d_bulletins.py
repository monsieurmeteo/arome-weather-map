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
    import argparse
    parser = argparse.ArgumentParser(description="Pilotage de la génération des 32 bulletins vidéo.")
    parser.add_argument('--group', type=int, choices=range(1, 16), help="Numéro du groupe à générer (1 à 15)")
    parser.add_argument('--collate', action='store_true', help="Rassembler toutes les vidéos, créer le ZIP, faire le release et envoyer l'e-mail")
    parser.add_argument('--test-mode', action='store_true', help="Forcer le mode test")
    args = parser.parse_args()

    scripts_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Résolution dynamique des dossiers cartes_alertes
    if os.environ.get("GITHUB_ACTIONS"):
        project_root = os.path.abspath(os.path.join(scripts_dir, ".."))
        cartes_dir = os.path.join(project_root, "cartes_alertes")
    else:
        cartes_dir = os.path.expanduser(r"~\Desktop\cartes_alertes")
        
    os.makedirs(cartes_dir, exist_ok=True)

    # Si aucun argument n'est fourni, on lance tout séquentiellement puis on fait la collation (comportement d'origine)
    run_all_sequentially = (args.group is None and not args.collate)

    if run_all_sequentially or (args.group is not None):
        print("==================================================")
        print(f"   GÉNÉRATION - GROUPE {args.group if args.group else 'TOUT'} ")
        print("==================================================")
        
        # Déterminer quels groupes générer
        groups_to_run = [args.group] if args.group else list(range(1, 16))
        
        for g in groups_to_run:
            if 1 <= g <= 14:
                zone = ZONES[g - 1]
                print(f"\n🌍 Groupe {g} : Traitement de la zone standard (14 jours) : {zone}...")
                # 1. Génération des cartes 14 jours (Paysage)
                run_command(["python", "generate_meteofrance_maps.py", "--zone", zone, "--days", "14", "--orientation", "landscape"], scripts_dir)
                # 2. Vidéo Paysage
                run_command(["python", "generate_video_bulletin.py", "--zone", zone, "--days", "14", "--orientation", "landscape", "--skip-maps"], scripts_dir)
                # 3. Génération des cartes 14 jours (Portrait)
                run_command(["python", "generate_meteofrance_maps.py", "--zone", zone, "--days", "14", "--orientation", "portrait"], scripts_dir)
                # 4. Vidéo Portrait
                run_command(["python", "generate_video_bulletin.py", "--zone", zone, "--days", "14", "--orientation", "portrait", "--skip-maps"], scripts_dir)
            elif g == 15:
                print(f"\n👴 Groupe 15 : Traitement des 4 bulletins spécifiques Patrick (5 jours)...")
                patrick_zones = ["france_pictos", "hdf"]
                for zone in patrick_zones:
                    # 1. Cartes Patrick Paysage
                    run_command(["python", "generate_meteofrance_maps.py", "--zone", zone, "--days", "5", "--orientation", "landscape", "--patrick", "--temp-highlight"], scripts_dir)
                    # 2. Vidéo Patrick Paysage
                    run_command(["python", "generate_video_bulletin.py", "--zone", zone, "--days", "5", "--orientation", "landscape", "--patrick", "--skip-maps"], scripts_dir)
                    # 3. Cartes Patrick Portrait
                    run_command(["python", "generate_meteofrance_maps.py", "--zone", zone, "--days", "5", "--orientation", "portrait", "--patrick", "--temp-highlight"], scripts_dir)
                    # 4. Vidéo Patrick Portrait
                    run_command(["python", "generate_video_bulletin.py", "--zone", zone, "--days", "5", "--orientation", "portrait", "--patrick", "--skip-maps"], scripts_dir)

    if run_all_sequentially or args.collate:
        print("\n==================================================")
        print("   COMPILATION ZIP ET ENVOI DE L'EMAIL            ")
        print("==================================================")
        
        zip_name = "bulletins_complets_14j.zip"
        zip_path = os.path.join(cartes_dir, zip_name)
        
        try:
            if os.path.exists(zip_path):
                os.remove(zip_path)
                
            # Trouver toutes les vidéos mp4 dans le dossier cartes_dir
            video_files = [f for f in os.listdir(cartes_dir) if f.endswith(".mp4") and f.startswith("bulletin_")]
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
                for v_file in video_files:
                    v_path = os.path.join(cartes_dir, v_file)
                    zipf.write(v_path, arcname=v_file)
                    print(f"  -> Ajouté au ZIP : {v_file}")
            print(f"Archive ZIP créée avec succès contenant {len(video_files)} vidéos.")
        except Exception as e:
            print(f"Erreur lors de la compression ZIP : {e}")
            sys.exit(1)
            
        download_url = f"https://github.com/gregorylanglet59264-byte/meteo-kappa/releases/download/bulletins-14j-latest/{zip_name}"
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
        if args.test_mode or (len(sys.argv) > 1 and sys.argv[1] == "--test-mode"):
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
