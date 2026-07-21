# -*- coding: utf-8 -*-
import urllib.request
import urllib.parse
import re
import json
import os

def rot13(s):
    res = []
    for c in s:
        if 'a' <= c <= 'z':
            res.append(chr((ord(c) - 97 + 13) % 26 + 97))
        elif 'A' <= c <= 'Z':
            res.append(chr((ord(c) - 65 + 13) % 26 + 65))
        else:
            res.append(c)
    return "".join(res)

def get_session_token():
    print("Connexion à Météo-France pour récupérer le token de session...")
    url = "https://vigilance.meteofrance.fr/fr"
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    )
    
    mfsession = None
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            headers = response.getheaders()
            for header, value in headers:
                if header.lower() == 'set-cookie' and 'mfsession=' in value:
                    m = re.search(r'mfsession=([^;]+)', value)
                    if m:
                        mfsession = m.group(1)
                        break
    except Exception as e:
        print("Erreur lors de la récupération de la page principale:", e)
        return None
        
    if not mfsession:
        print("Impossible de trouver le cookie mfsession.")
        return None
        
    return rot13(urllib.parse.unquote(mfsession))

def main():
    token = get_session_token()
    if token:
        data = {"token": token}
        token_file = "meteofrance_token.json"
        with open(token_file, "w", encoding="utf-8") as f:
            json.dump(data, f)
        print(f"\n[SUCCÈS] Token mis à jour avec succès dans {os.path.abspath(token_file)} !")
        print(f"Nouveau token : {token[:30]}...")
    else:
        print("\n[ERREUR] Impossible de régénérer le token Météo-France.")

if __name__ == "__main__":
    main()
