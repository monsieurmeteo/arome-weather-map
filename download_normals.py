import urllib.request
import json
import os

def download_and_save_normals():
    url = "https://www.infoclimat.fr/climato/indicateur_national_xhr.php?years[]=2026&normes=1991-2020&indic=mf"
    req = urllib.request.Request(
        url, 
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.infoclimat.fr/climato/indicateur_national.php'
        }
    )
    
    print("Downloading normals from Infoclimat...")
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        
    mf_data = data.get('mf', {})
    normals = {
        "tml": mf_data.get('tm8110', []),
        "tnl": mf_data.get('tn8110', []),
        "txl": mf_data.get('tx8110', [])
    }
    
    output_path = "normales_indicateur_national.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(normals, f, indent=2, ensure_ascii=False)
        
    print(f"Normals successfully saved to {output_path}!")
    print("Tm normals count:", len(normals["tml"]))
    print("Tn normals count:", len(normals["tnl"]))
    print("Tx normals count:", len(normals["txl"]))

if __name__ == "__main__":
    download_and_save_normals()
