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
        print("[SMTP] E-mail Météo Kappa envoyé avec succès !")
        return True
    except Exception as e:
        print(f"[SMTP] Erreur d'envoi du mail Kappa : {e}")
        return False

def main():
    scripts_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(scripts_dir, ".."))
    export_script = os.path.join(scripts_dir, "export_all_bulletins.py")
    
    day_offset = 1  # Toujours le lendemain par défaut
    
    print("=== ÉTAPE 1 : Génération des cartes et des bulletins Kappa ===")
    cmd = ["python", export_script, "--day-offset", str(day_offset), "--generate-maps"]
    print(f"Exécution : {' '.join(cmd)}")
    
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Erreur lors de la génération des bulletins : {e}")
        sys.exit(1)
        
    print("\n=== ÉTAPE 2 : Lecture du rapport textuel ===")
    suffix = "demain" if day_offset == 1 else "aujourdhui"
    report_filename = f"BULLETINS_AUTOMATIQUES_{suffix.upper()}.txt"
    report_path = os.path.join(project_root, report_filename)
    
    if not os.path.exists(report_path):
        print(f"Erreur : Le fichier de rapport {report_path} n'a pas été trouvé.")
        sys.exit(1)
        
    with open(report_path, "r", encoding="utf-8") as f:
        report_text = f.read()
        
    print("\n=== ÉTAPE 2.5 : Compression ZIP de AUTOMATISATION.json ===")
    json_path = os.path.join(project_root, "AUTOMATISATION.json")
    
    FRENCH_WEEKDAYS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"]
    tomorrow = datetime.date.today() + datetime.timedelta(days=day_offset)
    day_name = FRENCH_WEEKDAYS[tomorrow.weekday()]
    zip_name = f"AUTOMATISATION_{day_name}.zip"
    zip_path = os.path.join(project_root, zip_name)
    
    if os.path.exists(json_path):
        import zipfile
        print(f"Compression de {json_path} vers {zip_path}...")
        try:
            # Supprimer les anciens fichiers ZIP du dossier pour ne pas encombrer le dépôt
            for f_item in os.listdir(project_root):
                if f_item.startswith("AUTOMATISATION_") and f_item.endswith(".zip"):
                    try:
                        os.remove(os.path.join(project_root, f_item))
                        print(f"Ancien ZIP supprimé : {f_item}")
                    except Exception:
                        pass
                        
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
                zipf.write(json_path, arcname="AUTOMATISATION.json")
            print(f"Fichier ZIP créé avec succès : {zip_name}")
        except Exception as e:
            print(f"Erreur lors de la compression ZIP : {e}")
    else:
        print(f"Erreur : {json_path} introuvable. Impossible de créer le ZIP.")

    # Génération du lien de téléchargement
    download_url = f"https://github.com/gregorylanglet59264-byte/meteo-kappa/raw/main/cnews/{zip_name}"
    
    # Corps HTML de l'e-mail avec style épuré et bouton/lien masqué
    email_body = (
        f"<html><body style='font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif; font-size: 15px; color: #333; line-height: 1.6;'>"
        f"Bonjour,<br><br>"
        f"Le bulletin météo automatique pour demain (<strong>{get_french_date_string(tomorrow)}</strong>) a été généré avec succès.<br><br>"
        f"👉 <a href='{download_url}' style='color: #1a73e8; font-weight: bold; text-decoration: underline;'>Cliquer sur le lien pour télécharger vos fichiers</a><br><br>"
        f"Cordialement,<br>"
        f"L'automatisation Météo Kappa"
        f"</body></html>"
    )
        
    print("\n=== ÉTAPE 3 : Envoi de l'e-mail ===")
    subject = f"Vos bulletins radio du {get_french_date_string(tomorrow)}"
    
    recipients = os.environ.get("RECIPIENT_EMAILS", "gregory.langlet@sfr.fr, langlet.gregory@gmail.com, patrick.marliere@wanadoo.fr")
    send_email(email_body, subject, recipients)

if __name__ == "__main__":
    main()
