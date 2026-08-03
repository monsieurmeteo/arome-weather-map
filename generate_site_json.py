"""
generate_site_json.py
Wrapper léger autour de generate_meteofrance_maps.py pour l'alimentation du site web.
Seule différence : démarre à J0 (aujourd'hui) au lieu de J+1.
"""
import subprocess, sys, os, tempfile

script = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'generate_meteofrance_maps.py')

with open(script, 'r', encoding='utf-8') as f:
    code = f.read()

# Unique différence : démarrer à J0 (aujourd'hui) et non J+1
code = code.replace('default_start_tomorrow = True', 'default_start_tomorrow = False', 1)

with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, encoding='utf-8') as tmp:
    tmp.write(code)
    tmp_path = tmp.name

try:
    # Passe tous les arguments en ligne de commande tels quels
    args = [sys.executable, tmp_path] + sys.argv[1:]
    result = subprocess.run(args)
    sys.exit(result.returncode)
finally:
    os.unlink(tmp_path)
