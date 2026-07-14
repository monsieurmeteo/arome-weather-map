import urllib.request
import re
import json
import os

def scrape():
    url = "https://www.meteociel.fr/observations-meteo/temperature-de-la-mer.php?mode=3"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    
    print(f"Fetching {url}...")
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('iso-8859-1')
    except Exception as e:
        print(f"Error fetching data: {e}")
        return

    # Regex to capture: onmouseover="pop('time', 'tooltip', ...)" coords="..." href="..."
    pattern = re.compile(
        r'<area[^>]*onmouseover="pop\(\'([^\']*)\',\s*\'([^\']*)\'[^>]*coords="([^"]*)"[^>]*href=\'([^\']*)\'',
        re.IGNORECASE
    )
    
    stations = []
    unique_stations = {}
    
    matches = pattern.findall(html)
    print(f"Found {len(matches)} raw station matches.")
    
    for time, tooltip, coords, href in matches:
        # Extract station code from href
        code_match = re.search(r'code2=([^&]+)', href)
        code = code_match.group(1) if code_match else None
        
        # Tooltip contains: "Bateau Name<hr>Temp&eacute;rature mer : <i>24&deg;C</i>"
        # or "Bou&eacute;e Name<hr>Temp&eacute;rature mer : <i>20.4&deg;C</i>"
        name_match = re.search(r'^([^<]+)', tooltip)
        name = name_match.group(1) if name_match else tooltip
        
        # Clean HTML entities in name
        name = name.replace('Bou&eacute;e', 'Bouée')
        name = name.replace('Bou&amp;eacute;e', 'Bouée')
        
        temp_match = re.search(r'Temp&eacute;rature mer : <i>([^<]+)<\/i>', tooltip, re.IGNORECASE)
        temp_str = temp_match.group(1) if temp_match else None
        
        # Parse temp to float
        temp_val = None
        if temp_str:
            # remove °C, &deg;C, etc.
            temp_clean = re.sub(r'[^\d\.]', '', temp_str)
            try:
                temp_val = float(temp_clean)
            except ValueError:
                pass

        # Parse coordinates (x1, y1, x2, y2)
        coord_parts = [float(c) for c in coords.split(',')]
        if len(coord_parts) == 4:
            x = (coord_parts[0] + coord_parts[2]) / 2.0
            y = (coord_parts[1] + coord_parts[3]) / 2.0
        else:
            x, y = 0.0, 0.0

        # Apply quadratic transformation to get real Latitude and Longitude
        lat = -9.75642305097153e-06 * x**2 + 1.439925105370141e-05 * y**2 + 2.781349853793301e-06 * x * y + 0.004347633155021161 * x - 0.02829389797350603 * y + 54.923001472846494
        lon = -2.400606415419417e-06 * x**2 + 5.865744479926097e-06 * y**2 - 1.0778049877159004e-05 * x * y + 0.032083842849803444 * x - 0.0004295572122314075 * y - 9.222780340387118

        lat = round(lat, 4)
        lon = round(lon, 4)
        
        station_id = code if code else name
        
        # Determine type
        stn_type = "bateau" if "bateau" in name.lower() else "bouee"
        
        # Store latest data per station
        unique_stations[station_id] = {
            "id": station_id,
            "name": name,
            "type": stn_type,
            "latitude": lat,
            "longitude": lon,
            "temperature": temp_val,
            "time": time,
            "pixel_coords": [round(x, 1), round(y, 1)]
        }

    stations_list = list(unique_stations.values())
    
    # Save to public/data/sea_temperatures.json
    output_dir = "public/data"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "sea_temperatures.json")
    
    json_data_str = json.dumps(stations_list, ensure_ascii=False, indent=2)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(json_data_str)
        
    print(f"Successfully scraped {len(stations_list)} unique stations. Saved to {output_path}")

    # Try uploading to Supabase Storage
    supabase_url = os.environ.get('SUPABASE_URL') or os.environ.get('VITE_SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('VITE_SUPABASE_SERVICE_ROLE_KEY')

    # Load from .env.local if not in environment
    if (not supabase_url or not supabase_key) and os.path.exists('.env.local'):
        with open('.env.local', 'r') as f:
            for line in f:
                if '=' in line and not line.strip().startswith('#'):
                    k, v = line.strip().split('=', 1)
                    k = k.strip()
                    v = v.strip().strip('"\'')
                    if k in ('VITE_SUPABASE_URL', 'SUPABASE_URL'):
                        supabase_url = v
                    elif k in ('VITE_SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_ROLE_KEY'):
                        supabase_key = v

    if supabase_url and supabase_key:
        print("Uploading sea_temperatures.json to Supabase Storage...")
        upload_url = f"{supabase_url}/storage/v1/object/vigilance-captures/sea_temperatures.json"
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json",
            "x-upsert": "true"
        }
        req = urllib.request.Request(upload_url, data=json_data_str.encode('utf-8'), headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req) as response:
                print("✅ Successfully uploaded to Supabase Storage:", response.read().decode('utf-8'))
        except Exception as e:
            print(f"⚠️ Failed to upload to Supabase Storage: {e}")
    else:
        print("ℹ️ Supabase credentials not found, skipping storage upload.")

if __name__ == "__main__":
    scrape()
