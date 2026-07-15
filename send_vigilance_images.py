# -*- coding: utf-8 -*-
"""
send_vigilance_images.py
────────────────────────
Génère les cartes de vigilance Météo-France (National + 13 Régions) avec incrustation du logo
et les envoie directement par e-mail en pièces jointes à Patrick Marlière et Grégoire.

Logique horaire :
- Avant 12h00 : Cartes de vigilance pour AUJOURD'HUI (J)
- Après 12h00 : Cartes de vigilance pour DEMAIN (J+1)
"""

import sys
import os
import shutil
import smtplib
import json
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email import encoders

# Ajouter le dossier courant au PATH Python
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_DIR)

from generate_video_bulletin import capture_and_compose_vigilance

# Détection dynamique du destinataire (Grégoire ou Patrick) selon qui clique sur le dashboard
TRIGGER_ACTOR = os.environ.get("TRIGGER_ACTOR", "").lower()
if "monsieurmeteo" in TRIGGER_ACTOR:
    RECIPIENTS = ["patrick.marliere@wanadoo.fr", "gregory.langlet@sfr.fr"]
    print(f"Déclenché par Patrick ({TRIGGER_ACTOR}) -> Envoi à Patrick et Grégoire", flush=True)
else:
    RECIPIENTS = ["gregory.langlet@sfr.fr"]
    print(f"Déclenché par Grégoire (ou en local) -> Envoi uniquement à Grégoire (test)", flush=True)

# Zones à générer
ZONES = {
    "france_pictos": "National",
    "hdf": "Hauts-de-France",
    "normandie": "Normandie",
    "idf": "Île-de-France",
    "grandest": "Grand-Est",
    "ara": "Auvergne-Rhône-Alpes",
    "naq": "Nouvelle-Aquitaine",
    "occitanie": "Occitanie",
    "paca": "Provence-Alpes-Côte d'Azur",
    "bfc": "Bourgogne-Franche-Comté",
    "bretagne": "Bretagne",
    "pdl": "Pays de la Loire",
    "cvl": "Centre-Val de Loire",
    "corse": "Corse"
}

def get_smtp_config():
    # 1. Tenter de lire depuis les variables d'environnement (Gmail ou SFR)
    gmail_email = os.environ.get("GMAIL_EMAIL")
    gmail_password = os.environ.get("GMAIL_APP_PASSWORD")
    if gmail_email and gmail_password:
        return {
            "email": gmail_email,
            "password": gmail_password,
            "smtp_server": "smtp.gmail.com",
            "smtp_port": 587
        }

    sfr_password = os.environ.get("SFR_PASSWORD")
    if sfr_password:
        return {
            "email": "gregory.langlet@sfr.fr",
            "password": sfr_password,
            "smtp_server": "smtp.sfr.fr",
            "smtp_port": 587
        }
    
    # 2. Lire depuis la configuration locale (config.json)
    local_config_path = r"C:\Users\grego\.gemini\config\skills\mail\config.json"
    if os.path.exists(local_config_path):
        try:
            with open(local_config_path, "r", encoding="utf-8") as f:
                cfg = json.load(f)
                return {
                    "email": cfg.get("email"),
                    "password": cfg.get("password"),
                    "smtp_server": cfg.get("smtp_server", "smtp.sfr.fr"),
                    "smtp_port": int(cfg.get("smtp_port", 587))
                }
        except Exception as e:
            print(f"Erreur de lecture du config.json local : {e}")
            
    return None

def main():
    now = datetime.now()
    hour = now.hour
    
    # Choix de la période : Avant 12h = Aujourd'hui (0), Après 12h = Demain (1)
    period = 0 if hour < 12 else 1
    period_label = "Aujourd'hui" if period == 0 else "Demain"
    
    print(f"--- Lancement de la génération des vigilances ({period_label}) ---")
    
    # Créer un dossier temporaire propre pour les cartes
    temp_dir = os.path.join(PROJECT_DIR, "temp_vigilance")
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)
    
    attachments = []
    
    for zone, name in ZONES.items():
        filename = f"carte_vigilance_{zone}.jpg"
        output_path = os.path.join(temp_dir, filename)
        
        print(f"Capture de la zone {name} ({zone})...")
        try:
            # capture_and_compose_vigilance fait la capture et incruste le logo automatiquement
            success = capture_and_compose_vigilance(zone, "landscape", output_path, period=period)
            if success and os.path.exists(output_path):
                attachments.append((output_path, filename))
                print(f"✅ Générée avec succès : {filename}")
            else:
                print(f"❌ Échec de génération pour {name}")
        except Exception as e:
            print(f"💥 Erreur lors de la capture pour {name} : {e}")

    if not attachments:
        print("❌ Aucune carte de vigilance n'a pu être générée. Envoi de l'e-mail annulé.")
        return

    # Configuration SMTP
    smtp_cfg = get_smtp_config()
    if not smtp_cfg:
        print("❌ Configuration SMTP introuvable (GMAIL/SFR ou config.json absent).")
        return

    # Création du message
    subject = f"🛡️ Cartes de Vigilance Météo-France ({period_label}) - {now.strftime('%d/%m/%Y')}"
    body = (
        "Bonjour Patrick, Bonjour Grégoire,\n\n"
        f"Voici les cartes de vigilance Météo-France pour {period_label.lower()} ({now.strftime('%d/%m/%Y')}) "
        "générées automatiquement pour le niveau national et les 13 régions de France.\n\n"
        "Vous trouverez les cartes avec le logo incrusté en pièces jointes de cet e-mail.\n\n"
        "Bonne réception,\n"
        "Votre Assistant Météo Automatique"
    )

    msg = MIMEMultipart()
    msg['From'] = smtp_cfg["email"]
    msg['To'] = ", ".join(RECIPIENTS)
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain', 'utf-8'))

    # Attacher les images
    for filepath, filename in attachments:
        try:
            with open(filepath, "rb") as attachment:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header(
                    "Content-Disposition",
                    f"attachment; filename= {filename}",
                )
                msg.attach(part)
        except Exception as e:
            print(f"Erreur lors de l'attachement de {filename} : {e}")

    # Envoi de l'e-mail
    print("📧 Connexion au serveur SMTP et envoi de l'e-mail...", flush=True)
    try:
        if smtp_cfg["smtp_port"] == 465:
            server = smtplib.SMTP_SSL(smtp_cfg["smtp_server"], smtp_cfg["smtp_port"], timeout=30)
        else:
            server = smtplib.SMTP(smtp_cfg["smtp_server"], smtp_cfg["smtp_port"], timeout=30)
            server.starttls()
            
        server.login(smtp_cfg["email"], smtp_cfg["password"])
        server.sendmail(smtp_cfg["email"], RECIPIENTS, msg.as_string())
        server.quit()
        print("✅ E-mail envoyé avec succès !", flush=True)
    except Exception as e:
        print(f"❌ Échec de l'envoi de l'e-mail : {e}", flush=True)
    finally:
        # Nettoyage du dossier temporaire
        try:
            shutil.rmtree(temp_dir)
            print("Dossier temporaire nettoyé.", flush=True)
        except Exception:
            pass

if __name__ == "__main__":
    main()
