"""
generate_site_json.py
Wrapper léger autour de generate_meteofrance_maps.py pour l'alimentation du site web.
Seule différence : démarre à J0 (aujourd'hui) au lieu de J+1.
"""
import subprocess, sys, os

script_dir = os.path.dirname(os.path.abspath(__file__))
script = os.path.join(script_dir, 'generate_meteofrance_maps.py')

with open(script, 'r', encoding='utf-8') as f:
    code = f.read()

# Unique différence : démarrer à J0 (aujourd'hui) et non J+1
code = code.replace('default_start_tomorrow = True', 'default_start_tomorrow = False', 1)

tmp_path = os.path.join(script_dir, '_temp_site_generator.py')

try:
    with open(tmp_path, 'w', encoding='utf-8') as tmp:
        tmp.write(code)
    
    # Passe tous les arguments en ligne de commande tels quels
    args = [sys.executable, tmp_path] + sys.argv[1:]
    result = subprocess.run(args)
    sys.exit(result.returncode)
finally:
    if os.path.exists(tmp_path):
        os.remove(tmp_path)

