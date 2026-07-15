import os
import sys

# Ajouter le répertoire courant au path pour importer generate_video_bulletin
script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(script_dir)

from generate_video_bulletin import capture_and_compose_vigilance

# Créer le répertoire de sortie cartes_alertes
project_root = os.path.abspath(os.path.join(script_dir, ".."))
cartes_dir = os.path.join(project_root, "cartes_alertes")
os.makedirs(cartes_dir, exist_ok=True)

# Définir les chemins des fichiers de sortie
vigilance_land = os.path.join(cartes_dir, "carte_vigilance_france_pictos.jpg")
vigilance_port = os.path.join(cartes_dir, "carte_vigilance_france_pictos_portrait.jpg")

print("=== CAPTURE VIGILANCE FRANCE PAYSAGE ===")
capture_and_compose_vigilance("france_pictos", "landscape", vigilance_land)
if os.path.exists(vigilance_land):
    print(f"✅ Succès : {vigilance_land} créé (Taille: {os.path.getsize(vigilance_land)} octets)")
else:
    print(f"❌ Échec de création : {vigilance_land}")

print("\n=== CAPTURE VIGILANCE FRANCE PORTRAIT ===")
capture_and_compose_vigilance("france_pictos", "portrait", vigilance_port)
if os.path.exists(vigilance_port):
    print(f"✅ Succès : {vigilance_port} créé (Taille: {os.path.getsize(vigilance_port)} octets)")
else:
    print(f"❌ Échec de création : {vigilance_port}")
