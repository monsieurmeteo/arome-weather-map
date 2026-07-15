# -*- coding: utf-8 -*-
"""
send_daily_cnews_obs_email.py
Coordonne la collecte et l'envoi par e-mail des cartes d'observations du jour
pour CNews à Grégoire et Patrick Marlière.
"""

import sys
import os
import subprocess
from datetime import datetime

# Chemins
MAIL_CLIENT = r"C:\Users\grego\.gemini\config\skills\mail\scripts\mail_client.py"
DEST_DIR    = r"C:\Users\grego\Desktop\cartes_alertes"

# Destinataires
RECIPIENTS = ["gregory.langlet@sfr.fr", "patrick.marliere@wanadoo.fr"]

def get_today_attachments():
    date_str = datetime.now().strftime("%Y%m%d")
    attachments = []
    
    # Cartes d'observations clés à envoyer
    targets = [
        # France entière
        ("france", f"carte_obs_france_bilan_jour_{date_str}.jpg"),
        ("france", f"carte_obs_france_tmax_{date_str}.jpg"),
        # Hauts-de-France
        ("hdf", f"carte_obs_hdf_bilan_jour_{date_str}.jpg"),
        ("hdf", f"carte_obs_hdf_tmax_{date_str}.jpg"),
        # Nouvelle-Aquitaine
        ("naq", f"carte_obs_naq_bilan_jour_{date_str}.jpg"),
        ("naq", f"carte_obs_naq_tmax_{date_str}.jpg"),
    ]
    
    for zone, filename in targets:
        filepath = os.path.join(DEST_DIR, zone, filename)
        if os.path.exists(filepath):
            attachments.append(filepath)
        else:
            print(f"⚠️ Carte non trouvée : {filepath}")
            
    return attachments

def main():
    if not os.path.exists(MAIL_CLIENT):
        print("⚠️ Client mail non trouvé. L'envoi d'e-mail est ignoré (normal en environnement GitHub Actions).")
        return
        
    attachments = get_today_attachments()
    if not attachments:
        print("❌ Aucune carte générée aujourd'hui à envoyer.")
        return
        
    subject = f"📊 Cartes d'observations Météo CNews du {datetime.now().strftime('%d/%m/%Y')}"
    body = (
        "Bonjour Patrick, Bonjour Grégoire,\n\n"
        "Voici les cartes d'observations climatologiques du jour (CNews Météo Climat Pro) "
        "générées automatiquement pour la France entière, les Hauts-de-France et la Nouvelle-Aquitaine.\n\n"
        "Vous trouverez les cartes du Bilan du Jour et des Températures Maximales en pièces jointes.\n\n"
        "Bonne réception et bonne émission,\n"
        "Votre Assistant Météo Automatique"
    )
    
    # Envoyer l'email à chaque destinataire
    for to in RECIPIENTS:
        cmd = [
            "python", MAIL_CLIENT, "send",
            "--to", to,
            "--subject", subject,
            "--body", body
        ]
        
        # Ajouter les fichiers joints
        if attachments:
            cmd.append("--attach")
            cmd.extend(attachments)
            
        print(f"📧 Envoi de l'e-mail à {to}...")
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, check=True)
            print(f"✅ E-mail envoyé avec succès à {to} !")
        except subprocess.CalledProcessError as e:
            print(f"❌ Erreur lors de l'envoi à {to} : {e.stderr}")

if __name__ == "__main__":
    main()
