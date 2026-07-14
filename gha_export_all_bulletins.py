import sys
import argparse
import time
import json
import base64
import os
import subprocess
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sync_playwright = None

def get_base64_image(path):
    if os.path.exists(path):
        try:
            with open(path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                return f"data:image/jpeg;base64,{encoded_string}"
        except Exception as e:
            print(f"Warning: Failed to read image {path}: {e}")
    return None

def run_map_generator(region, day_offset):
    zone = region if region else "france_pictos"
    days = 5 if region else 8
    
    # Résolution relative d'abord (dépôt unifié) puis fallback absolu Windows
    script_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "meteo_cnews_2", "generate_meteofrance_maps.py"))
    if not os.path.exists(script_path):
        script_path = r"C:\Users\grego\Documents\METEO_CLIMAT\meteo cnews 2\generate_meteofrance_maps.py"
    
    if not os.path.exists(script_path):
        print(f"Warning: Map generator script not found at {script_path}. Skipping generation.")
        return False
        
    print(f"Launching map generator for zone '{zone}' ({days} days)...")
    cmd = ["python", script_path, "--zone", zone, "--days", str(days), "--orientation", "landscape"]
    if day_offset >= 1:
        cmd.append("--start-tomorrow")
        
    try:
        subprocess.run(cmd, check=True)
        print("Map generation completed successfully.")
        return True
    except Exception as e:
        print(f"Warning: Map generator failed: {e}")
        return False

import datetime

FRENCH_WEEKDAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
FRENCH_MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]

def get_french_date_string(date_obj, include_year=True):
    weekday = FRENCH_WEEKDAYS[date_obj.weekday()]
    day = date_obj.day
    month = FRENCH_MONTHS[date_obj.month - 1]
    if include_year:
        return f"{weekday} {day} {month} {date_obj.year}"
    else:
        return f"{weekday} {day} {month}"

def update_form_dates_locally(form, day_offset):
    today = datetime.date.today()
    date_j1 = today + datetime.timedelta(days=day_offset)
    date_j2 = today + datetime.timedelta(days=day_offset + 1)
    
    day1_str = get_french_date_string(date_j1, include_year=True)
    day2_str = get_french_date_string(date_j2, include_year=False)
    
    form["bulletinDate"] = day1_str
    form["summaryTitle"] = f"Prévisions pour la journée du {day1_str.upper()}"
    form["summaryTitle2"] = f"Prévisions pour la journée du {day2_str.upper()}"
    form["alertTitle"] = f"Vigilance pour ce {day1_str}"

def save_vision_forecast_report(clients, output_filename, day_offset):
    """Sauvegarde dans un fichier texte structuré l'intégralité des prévisions et commentaires visuels par carte pour chaque client."""
    report_lines = []
    today = datetime.date.today()
    d1 = today + datetime.timedelta(days=day_offset)
    date_str = get_french_date_string(d1, include_year=True)
    
    report_lines.append("================================================================================")
    report_lines.append(f"📡 RAPPORT EXHAUSTIF DES PRÉVISIONS VISUELLES (MODE VISIO EN PLATEAU)\nDATE CIBLE : {date_str.upper()}\nFICHIER SOURCE : {output_filename}")
    report_lines.append("================================================================================\n")
    
    for c in clients:
        name = c.get("name", "Client inconnu")
        form = c.get("form", {})
        region = c.get("region", "")
        zone_carte = region if region else "france_pictos (National)"
        
        report_lines.append("--------------------------------------------------------------------------------")
        report_lines.append(f"📻 CLIENT / STATION : {name}")
        report_lines.append(f"🗺️ ZONE CARTE MÉTÉO-FRANCE : {zone_carte} (Cartes Matin & Après-midi)")
        report_lines.append("--------------------------------------------------------------------------------\n")
        
        report_lines.append("☀️ [1/6] RÉSUMÉ SYNOPTIQUE DU JOUR (todaySummary) :")
        report_lines.append(form.get("todaySummary", "(Non renseigné)").strip() + "\n")
        
        report_lines.append(f"🌅 [2/6] COMMENTAIRE CARTE MATIN (summaryMorning) -> Carte J{day_offset} Matin :")
        report_lines.append(form.get("summaryMorning", "(Non renseigné)").strip() + "\n")
        
        report_lines.append(f"🌞 [3/6] COMMENTAIRE CARTE APRÈS-MIDI (summaryAfternoon) -> Carte J{day_offset} Après-midi :")
        report_lines.append(form.get("summaryAfternoon", "(Non renseigné)").strip() + "\n")
        
        if form.get("beach"):
            report_lines.append(f"🏖️ [4/6] MÉTÉO DES PLAGES (beach) -> Littoral J{day_offset} :")
            report_lines.append(form.get("beach", "").strip() + "\n")
            
        if form.get("marine"):
            report_lines.append(f"🌊 [5/6] MÉTÉO MARINE (marine) -> Bassin maritime :")
            report_lines.append(form.get("marine", "").strip() + "\n")
            
        if form.get("recordsRaw") or form.get("mountain"):
            report_lines.append(f"🏔️ [6/6] PHÉNOMÈNES MARQUANTS & MONTAGNE (recordsRaw / mountain) :")
            if form.get("recordsRaw"):
                report_lines.append(form.get("recordsRaw", "").strip())
            if form.get("mountain"):
                report_lines.append(form.get("mountain", "").strip())
            report_lines.append("")
            
        report_lines.append("📉 TENDANCE PROCHAINS JOURS (forecastRaw) :\n" + form.get("forecastRaw", "(Non renseigné)").strip() + "\n\n")
        
    report_content = "\n".join(report_lines)
    
    report_path = output_filename.replace(".json", ".txt") if output_filename.endswith(".json") else "RAPPORT_PREVISIONS_VISIO.txt"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_content)
    print(f"\n📋 Rapport texte complet des prévisions par carte sauvegardé sous : {report_path}")
    
    desktop_path = os.path.expanduser(r"~\Desktop\RAPPORT_PREVISIONS_VISIO_DERNIER_RUN.txt")
    try:
        with open(desktop_path, "w", encoding="utf-8") as f:
            f.write(report_content)
        print(f"📋 Copie du rapport sur le Bureau : {desktop_path}")
    except Exception as e:
        print(f"Warning: Could not write report copy to desktop: {e}")


def main():
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    default_json_path = os.path.join(project_root, "AUTOMATISATION.json")

    parser = argparse.ArgumentParser(description="Update and export all weather bulletins as a single JSON")
    parser.add_argument("--day-offset", type=int, default=1, help="Day offset (0 for today, 1 for tomorrow, etc.)")
    parser.add_argument("--file", type=str, default=default_json_path, help="Path to the JSON data file")
    parser.add_argument("--url", type=str, default="http://localhost:8080", help="URL of the local development server")
    parser.add_argument("--output", type=str, default="", help="Path for the output JSON file")
    parser.add_argument("--generate-maps", action="store_true", help="Generate maps using meteo-cnews skill first")
    parser.add_argument("--skip-ai", action="store_true", help="Skip AI generation and use existing texts in JSON file")
    
    args = parser.parse_args()
    if not os.path.exists(args.file) and os.path.exists(default_json_path):
        args.file = default_json_path
    
    # 1. Map client names to their region codes
    region_mapping = {
        "BULLETIN EUROPE1 à 6h": "",
        "RADIO - ICI NORD": "hdf",
        "RADIO - ICI LA ROCHELLE": "naq",
        "RADIO 6": "hdf",
        "MONA FM": "hdf",
        "RADIO ICI NORMANDIE": "normandie",
        "RADIO ICI NORMANDIE ": "normandie"
    }
    
    # 1.5 Generate maps for unique zones sequentially (Chrome ProcessSingleton ne supporte pas le parallèle)
    if args.generate_maps:
        generated_zones = set()
        for c_name in region_mapping.values():
            if c_name not in generated_zones:
                run_map_generator(c_name, args.day_offset)
                generated_zones.add(c_name)
                time.sleep(3)  # laisser Chrome libérer le lock entre chaque zone
    
    maps_dir = os.path.abspath(os.path.join(project_root, "..", "cartes_alertes"))
    if not os.path.exists(maps_dir):
        maps_dir = r"C:\Users\grego\Desktop\cartes_alertes"
        
    offset1 = args.day_offset
    offset2 = args.day_offset + 1
    
    # 2. Load the original JSON and update ALL maps for ALL clients
    temp_json_path = "AUTOMATISATION_TEMP_EXPORT.json"
    try:
        with open(args.file, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        clients = data.get("clients", [])
        print(f"Loaded {len(clients)} clients from {args.file}")
        
        # Import AI helper
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        try:
            from ai_helper import generate_bulletin_texts
        except ImportError:
            print("Warning: Could not import ai_helper. Skipping AI texts.")
            generate_bulletin_texts = lambda *args: None

        for c in clients:
            name = c.get("name")
            region = region_mapping.get(name, "")
            region_prefix = f"{region}_" if region else ""
            
            # Map paths
            map_morning_1 = os.path.join(maps_dir, f"carte_{region_prefix}J{offset1}_matin.jpg")
            map_afternoon_1 = os.path.join(maps_dir, f"carte_{region_prefix}J{offset1}_apresmidi.jpg")
            map_morning_2 = os.path.join(maps_dir, f"carte_{region_prefix}J{offset2}_matin.jpg")
            map_afternoon_2 = os.path.join(maps_dir, f"carte_{region_prefix}J{offset2}_apresmidi.jpg")
            
            img_m1 = get_base64_image(map_morning_1)
            img_a1 = get_base64_image(map_afternoon_1)
            img_m2 = get_base64_image(map_morning_2)
            img_a2 = get_base64_image(map_afternoon_2)
            
            form = c.setdefault("form", {})
            
            # Update form dates locally to avoid inconsistencies
            update_form_dates_locally(form, args.day_offset)
            
            # Inject live vigilance data from Météo-France (compétence vigilance)
            try:
                from fetch_vigilance import get_vigilance_summary
                vi_index = min(args.day_offset, 1)
                v = get_vigilance_summary(vi_index)
                if v["formatted"]:
                    form["alert"] = v["formatted"]
                    form["alertSource"] = "Météo-France — vigilance.meteofrance.fr"
            except Exception as e:
                print(f"Warning: Could not fetch vigilance: {e}")
            
            # Generate and inject AI texts if available and not skipped (transmitting explicit base64 maps)
            if not args.skip_ai:
                img_list = [img for img in [img_m1, img_a1, img_m2, img_a2] if img]
                ai_texts = generate_bulletin_texts(name, c.get("cities", []), args.day_offset, images=img_list)
                if ai_texts:
                    print(f" - Injected AI-generated forecast texts for '{name}'")
                    for key, val in ai_texts.items():
                        form[key] = val
            
            if img_m1:
                c["form"]["summaryMapMorningUrl1"] = img_m1
            if img_a1:
                c["form"]["summaryMapAfternoonUrl1"] = img_a1
            if img_m2:
                c["form"]["summaryMapMorningUrl2"] = img_m2
            if img_a2:
                c["form"]["summaryMapAfternoonUrl2"] = img_a2

            # Inject forest fire risk map (regional map if available, fallback to national)
            zone_key = region if (region and region.strip()) else "france_pictos"
            forets_path = os.path.join(maps_dir, f"carte_forets_{zone_key}.jpg")
            
            # Fallback national si la carte régionale n'a pas été générée
            if not os.path.exists(forets_path):
                zone_key = "france_pictos"
                forets_path = os.path.join(maps_dir, f"carte_forets_{zone_key}.jpg")
                
            img_forets = get_base64_image(forets_path)
            if img_forets:
                date_j1 = datetime.date.today() + datetime.timedelta(days=args.day_offset)
                day1_str = get_french_date_string(date_j1, include_year=True)
                c["form"]["forestAlertImageUrl"] = img_forets
                c["form"]["forestAlertTitle"] = f"🌲 MÉTÉO DES FORÊTS DU {day1_str.upper()}"
                c["form"].setdefault("forestAlertSource", "Météo-Climat PRO — minisite-douai.vercel.app")
                c["form"]["showForestMap"] = True
                c["display"]["showForestMap"] = True
                print(f" - Injected forest fire risk map for '{name}' (Zone: '{zone_key}')")

            # Force reordering of sections: place 'forests' immediately after 'vigilance' for each client
            if "sections" in c and isinstance(c["sections"], list):
                sections = c["sections"]
                forests_sec = next((s for s in sections if s.get("id") == "forests"), None)
                if not forests_sec:
                    forests_sec = {"id": "forests", "title": "Forêts", "icon": "fa-tree", "visible": True}
                else:
                    # Remove it from its current position
                    sections = [s for s in sections if s.get("id") != "forests"]
                
                # Find vigilance index and insert forests right after
                vig_idx = next((i for i, s in enumerate(sections) if s.get("id") == "vigilance"), -1)
                if vig_idx != -1:
                    sections.insert(vig_idx + 1, forests_sec)
                else:
                    sections.insert(0, forests_sec)
                c["sections"] = sections

            print(f" - Injected maps for client: '{name}' (Region: '{region}')")
            
        with open(temp_json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
    except Exception as e:
        print(f"Error preparing config file: {e}")
        sys.exit(1)
        
    # Define output filename
    suffix = "demain" if args.day_offset == 1 else "aujourdhui"
    output_filename = args.output if args.output else f"BULLETINS_AUTOMATIQUES_{suffix.upper()}.json"
    if not os.path.isabs(output_filename):
        output_filename = os.path.join(project_root, output_filename)
    
    # Check if local server is running, if not, save directly
    import socket
    from urllib.parse import urlparse
    
    server_running = False
    try:
        parsed_url = urlparse(args.url)
        port = parsed_url.port or (443 if parsed_url.scheme == 'https' else 80)
        host = parsed_url.hostname
        with socket.create_connection((host, port), timeout=2):
            server_running = True
    except Exception:
        pass

    # If Playwright is not installed or the local server is offline, just save the prepared JSON directly
    if sync_playwright is None or not server_running:
        if not server_running and sync_playwright is not None:
            print(f"\n⚠️ Local dev server at {args.url} is offline. Saving JSON directly without Playwright UI sync.")
        import shutil
        shutil.copy(temp_json_path, output_filename)
        shutil.copy(temp_json_path, os.path.join(project_root, "AUTOMATISATION.json"))
        print(f"\n🎉 SUCCESS! Fully updated JSON saved directly as: {output_filename} and {os.path.join(project_root, 'AUTOMATISATION.json')}")
        save_vision_forecast_report(clients, output_filename, args.day_offset)
        if os.path.exists(temp_json_path):
            os.remove(temp_json_path)
        return

    # 3. Process all clients sequentially using Playwright
    client_names = [c.get("name") for c in clients if c.get("name")]
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Accept dialogs
        page.on("dialog", lambda dialog: dialog.accept())
        
        page.goto(args.url)
        page.wait_for_load_state("networkidle")
        
        # Upload data
        print("\nUploading prepared data file...")
        try:
            page.wait_for_selector('input[type="file"][accept=".json"]', state="attached", timeout=10000)
            page.evaluate("() => { const el = document.querySelector('input[type=\"file\"][accept=\".json\"]'); if(el) el.className = ''; }")
            page.set_input_files('input[type="file"][accept=".json"]', temp_json_path)
        except Exception as e:
            print(f"Warning: Could not upload using selector: {e}")
            page.set_input_files('input[type="file"][accept=".json"]', temp_json_path)
        
        for name in client_names:
            print(f"\n---> Updating client: '{name}'")
            # Select client
            page.get_by_text(name).first.click()
            
            # Select day offset
            page.select_option('select[title*="date"]', value=str(args.day_offset))
            
            # Wait for API forecasts load
            print("Waiting for API load...")
            time.sleep(2)
            page.wait_for_selector('button:has-text("API"):not([disabled])', timeout=15000)
            
            # Sync vigilance
            print("Synchronizing vigilance...")
            page.locator('button:has-text("SYNCHRONISER")').click()
            time.sleep(2)
            page.wait_for_selector('button:has-text("SYNCHRONISER"):not([disabled])', timeout=15000)
            
            print(f"Client '{name}' successfully updated.")
            
        # 4. Trigger JSON Export
        print("\nExporting final JSON...")
        time.sleep(1)
        
        # Define output filename
        suffix = "demain" if args.day_offset == 1 else "aujourdhui"
        output_filename = args.output if args.output else f"BULLETINS_AUTOMATIQUES_{suffix.upper()}.json"
        if not os.path.isabs(output_filename):
            output_filename = os.path.join(project_root, output_filename)
        
        with page.expect_download() as download_info:
            page.locator('button:has-text("Sauvegarder")').click()
            
        download = download_info.value
        download.save_as(output_filename)
        
        print(f"\n🎉 SUCCESS! Fully updated JSON saved as: {output_filename}")
        browser.close()
        save_vision_forecast_report(clients, output_filename, args.day_offset)
        
    # Clean up temp file
    if os.path.exists(temp_json_path):
        os.remove(temp_json_path)

if __name__ == "__main__":
    main()
