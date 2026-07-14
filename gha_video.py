#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Météo CNews — Générateur de Bulletin Vidéo Autonome (v7.0)
Régénère automatiquement les cartes Météo-France FRAÎCHES avant de compiler le bulletin,
garantissant que la vidéo utilisera toujours les prévisions du jour les plus récentes.
Intercale des plaques de transition professionnelles (logo centré + dégradé bleu nuit)
avant CHAQUE période de prévision (Matin, Après-midi, Soirée, Éphéméride).
Les transitions (crossfades) sont calées sur 1.0s pour un enchaînement calme et premium.
Force le taux d'images (fps=fps=24) et la base de temps (settb=1/24) pour tous les flux.
"""

import os
import sys
import argparse
import subprocess
import datetime
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import time

def safe_rmtree(path):
    if not os.path.exists(path):
        return
    for i in range(5):
        try:
            for root, dirs, files in os.walk(path, topdown=False):
                for name in files:
                    try:
                        os.remove(os.path.join(root, name))
                    except Exception:
                        pass
                for name in dirs:
                    try:
                        os.rmdir(os.path.join(root, name))
                    except Exception:
                        pass
            shutil.rmtree(path)
            return
        except Exception:
            time.sleep(0.2)
    shutil.rmtree(path)

def log(msg):
    print(f"[VIDEO-GEN] {msg}")

def get_font_path(prefer_bold=False):
    paths = []
    if prefer_bold:
        paths = [
            r"C:\Windows\Fonts\ARIALNB.TTF",
            r"C:\Windows\Fonts\arialbd.ttf",
            r"C:\Windows\Fonts\arial.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
        ]
    else:
        paths = [
            r"C:\Windows\Fonts\arial.ttf",
            r"C:\Windows\Fonts\arialbd.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
        ]
    for p in paths:
        if os.path.exists(p):
            return p
    return None

def get_video_duration(path):
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", path]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return float(res.stdout.strip())

def draw_gradient(width, height):
    base = Image.new("RGBA", (width, height), (2, 7, 18, 255))
    draw = ImageDraw.Draw(base)
    for y in range(height):
        r = int(12 - (10 * y / height))
        g = int(35 - (28 * y / height))
        b = int(70 - (58 * y / height))
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
    return base

def create_transition_frames(day_str, sub_str, width, height, logo_path, output_dir, prefix):
    # Check if we can use the custom templates
    if logo_path:
        cartes_dir = os.path.dirname(logo_path)
    else:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        cartes_dir = os.path.abspath(os.path.join(script_dir, "..", "cartes_alertes"))
        if not os.path.exists(cartes_dir):
            cartes_dir = os.path.expanduser(r"~\Desktop\cartes_alertes")
    template_name = "AVANT PREVI 008.png" if width > height else "AVANT PREVI 007.png"
    template_path = os.path.join(cartes_dir, template_name)
    
    if os.path.exists(template_path):
        try:
            # Load template
            bg_img = Image.open(template_path).convert("RGBA")
            t_width, t_height = bg_img.size
            
            # Dynamically erase the yellow line to keep the visual clean and professional
            if width > height:
                # Erase yellow rows 519, 520, 521 in AVANT PREVI 008.png
                for x in range(t_width):
                    bg_img.putpixel((x, 519), bg_img.getpixel((x, 517)))
                    bg_img.putpixel((x, 520), bg_img.getpixel((x, 517)))
                    bg_img.putpixel((x, 521), bg_img.getpixel((x, 517)))
                    bg_img.putpixel((x, 522), bg_img.getpixel((x, 517)))
            else:
                # Erase yellow rows 744, 745, 746 in AVANT PREVI 007.png
                for x in range(t_width):
                    bg_img.putpixel((x, 744), bg_img.getpixel((x, 742)))
                    bg_img.putpixel((x, 745), bg_img.getpixel((x, 742)))
                    bg_img.putpixel((x, 746), bg_img.getpixel((x, 742)))
            
            # Create text layer
            text_layer = Image.new("RGBA", (t_width, t_height), (0, 0, 0, 0))
            draw = ImageDraw.Draw(text_layer)
            font_path_bold = get_font_path(prefer_bold=True)
            if not font_path_bold:
                raise FileNotFoundError("Aucune police TTF supportée n'a été trouvée sur le système pour dessiner les transitions.")
            
            if width > height:
                # Landscape (1448 x 1086 template)
                font_day = ImageFont.truetype(font_path_bold, 60)
                max_w = 1100
                period_fs = min(180, int(max_w / (len(sub_str) * 0.6)))
                font_period = ImageFont.truetype(font_path_bold, period_fs)
                
                # Draw day centered around y = 394
                day_bbox = draw.textbbox((0, 0), day_str, font=font_day)
                day_w = day_bbox[2] - day_bbox[0]
                day_h = day_bbox[3] - day_bbox[1]
                day_x = (t_width - day_w) // 2
                draw.text((day_x, 394 - (day_h // 2)), day_str, fill=(255, 255, 255, 255), font=font_day)
                
                # Draw period centered around y = 544
                period_bbox = draw.textbbox((0, 0), sub_str, font=font_period)
                period_w = period_bbox[2] - period_bbox[0]
                period_h = period_bbox[3] - period_bbox[1]
                period_x = (t_width - period_w) // 2
                draw.text((period_x, 544 - (period_h // 2)), sub_str, fill=(255, 215, 0, 255), font=font_period)
            else:
                # Portrait (941 x 1672 template)
                font_day = ImageFont.truetype(font_path_bold, 50)
                max_w = 750
                period_fs = min(110, int(max_w / (len(sub_str) * 0.6)))
                font_period = ImageFont.truetype(font_path_bold, period_fs)
                
                # Draw day centered around y = 663
                day_bbox = draw.textbbox((0, 0), day_str, font=font_day)
                day_w = day_bbox[2] - day_bbox[0]
                day_h = day_bbox[3] - day_bbox[1]
                day_x = (t_width - day_w) // 2
                draw.text((day_x, 663 - (day_h // 2)), day_str, fill=(255, 255, 255, 255), font=font_day)
                
                # Draw period centered around y = 809
                period_bbox = draw.textbbox((0, 0), sub_str, font=font_period)
                period_w = period_bbox[2] - period_bbox[0]
                period_h = period_bbox[3] - period_bbox[1]
                period_x = (t_width - period_w) // 2
                draw.text((period_x, 809 - (period_h // 2)), sub_str, fill=(255, 215, 0, 255), font=font_period)
                
            # Generate 72 frames (zoom factor 1.0 to 1.04, 4% zoom is very clean)
            for f in range(72):
                scale_factor = 1.0 + 0.04 * (f / 71)
                
                new_w = int(t_width * scale_factor)
                new_h = int(t_height * scale_factor)
                scaled_text = text_layer.resize((new_w, new_h), Image.Resampling.LANCZOS)
                
                left = (new_w - t_width) // 2
                top = (new_h - t_height) // 2
                cropped_text = scaled_text.crop((left, top, left + t_width, top + t_height))
                
                frame_img = Image.alpha_composite(bg_img, cropped_text)
                frame_img = frame_img.resize((width, height), Image.Resampling.LANCZOS)
                
                frame_path = os.path.join(output_dir, f"{prefix}_frame_{f:03d}.jpg")
                frame_img.convert("RGB").save(frame_path, "JPEG", quality=95)
            return True
        except Exception as e:
            log(f"Erreur lors de la génération de l'animation pour {template_name}: {e}. Repli sur le dégradé par défaut.")
            
    # Fallback to standard gradient transition image (72 identical frames to keep logic consistent!)
    try:
        img = draw_gradient(width, height)
        draw = ImageDraw.Draw(img)
        
        logo_y = int(height * 0.18) if width > height else int(height * 0.22)
        if logo_path and os.path.exists(logo_path):
            logo = Image.open(logo_path).convert("RGBA")
            target_w = 380 if width > height else 290
            aspect = logo.height / logo.width
            target_h = int(target_w * aspect)
            logo = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
            logo_x = (width - target_w) // 2
            img.paste(logo, (logo_x, logo_y), logo)
            logo_y += target_h + (70 if width > height else 90)
            
        font_path_bold = get_font_path(prefer_bold=True)
        if not font_path_bold:
            raise FileNotFoundError("Aucune police TTF supportée n'a été trouvée sur le système pour dessiner les textes.")
        day_size = 75 if width > height else 65
        sub_size = 85 if width > height else 90
        
        font_day = ImageFont.truetype(font_path_bold, day_size)
        font_sub = ImageFont.truetype(font_path_bold, sub_size)
        
        day_bbox = draw.textbbox((0, 0), day_str, font=font_day)
        day_w = day_bbox[2] - day_bbox[0]
        day_x = (width - day_w) // 2
        draw.text((day_x, logo_y), day_str, fill=(255, 255, 255, 255), font=font_day)
        
        sub_bbox = draw.textbbox((0, 0), sub_str, font=font_sub)
        sub_w = sub_bbox[2] - sub_bbox[0]
        sub_x = (width - sub_w) // 2
        sub_y = logo_y + day_size + (45 if width > height else 55)
        draw.text((sub_x, sub_y), sub_str, fill=(255, 215, 0, 255), font=font_sub)
        
        for f in range(72):
            frame_path = os.path.join(output_dir, f"{prefix}_frame_{f:03d}.jpg")
            img.convert("RGB").save(frame_path, "JPEG", quality=95)
        return True
    except Exception as e:
        log(f"Erreur de repli: {e}")
        return False

# Correspondance code zone -> nom affiché sur le jingle
ZONE_LABELS = {
    "hdf":           "HAUTS-DE-FRANCE",
    "normandie":     "NORMANDIE",
    "ile-de-france": "ILE-DE-FRANCE",
    "grand-est":     "GRAND EST",
    "ara":           "AUVERGNE-RHONE-ALPES",
    "naq":           "NOUVELLE-AQUITAINE",
    "occitanie":     "OCCITANIE",
    "paca":          "PROVENCE-ALPES-COTE D'AZUR",
    "bfc":           "BOURGOGNE-FRANCHE-COMTE",
    "bretagne":      "BRETAGNE",
    "pdl":           "PAYS DE LA LOIRE",
    "cvl":           "CENTRE-VAL DE LOIRE",
    "corse":         "CORSE",
}


def capture_and_compose_vigilance(zone, orientation, output_path):
    zone_to_region = {
        "france_pictos": None,
        "hdf": "HDF",
        "naq": "NAQ",
        "normandie": "NOR",
        "ara": "ARA",
        "bfc": "BFC",
        "bretagne": "BRE",
        "cvl": "CVL",
        "corse": "COR",
        "grandest": "GES",
        "idf": "IDF",
        "occitanie": "OCC",
        "pdl": "PDL",
        "paca": "PAC"
    }
    region_id = zone_to_region.get(zone)
    url = f"https://minisite-douai.vercel.app/vigilance?period=1"
    if region_id:
        url += f"&region={region_id}"
        
    log(f"Capture de la carte de vigilance ({zone}) à J+1 (sans cadre blanc) via Playwright : {url}")
    
    temp_png = output_path.replace(".jpg", "_temp.png")
    
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        log("Erreur: Bibliothèque playwright non installée pour la vigilance.")
        return False
        
    import time
    success = False
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            # Force initial viewport to portrait (1080x1920) so that responsive layouts
            # always render the text bulletin card containing the vigilance details.
            page = browser.new_page()
            page.set_viewport_size({"width": 1080, "height": 1920})
            page.goto(url, wait_until="networkidle")
            
            try:
                page.wait_for_selector(".social-fb-container[data-ready='true']", state="attached", timeout=30000)
            except Exception as e:
                log(f"Warning: Timeout waiting for vigilance data-ready: {e}")
                
            time.sleep(0.3)
            
            # Inject our custom TV Studio layout directly inside JS using exact CNews DOM + icons + structure
            page.evaluate('''({ orientation, regionId }) => {
                let originalSvg = document.querySelector('svg.fb-svg-map');
                if (originalSvg) {
                    // ponytail: Tag SVG paths with department codes using React fiber keys so we can style Corsica (2A/2B) specifically
                    let paths = originalSvg.querySelectorAll('path');
                    paths.forEach(p => {
                        let key = Object.keys(p).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
                        if (key && p[key] && p[key].key) {
                            p.setAttribute('data-dep', p[key].key);
                        }
                    });
                }
                let svgContent = originalSvg ? originalSvg.innerHTML : '';
                let svgViewBox = originalSvg ? (originalSvg.getAttribute('viewBox') || '0 0 1100 1100') : '0 0 1100 1100';
                
                let el = document.querySelector('.bulletin-auto-card .bulletin-text-display') || document.querySelector('.region-hub-bulletin pre');
                let rawText = el ? el.innerText : "";
                
                let lines = rawText.split('\\n');
                let regionName = 'MÉTÉOROLOGIQUE';
                if (regionId) {
                    let r = String(regionId).toUpperCase();
                    if (r === 'HDF' || r === '32') regionName = 'HAUTS-DE-FRANCE';
                    else if (r === 'NORMANDIE' || r === 'NOR' || r === '28') regionName = 'NORMANDIE';
                    else if (r === 'NAQ' || r === '75') regionName = 'NOUVELLE-AQUITAINE';
                    else regionName = r;
                }
                let dateSub = "VENDREDI 10 JUILLET 2026";
                // ponytail: extract date from lines[0] because dateTitle is not defined in the page scope
                let firstLine = lines[0] || "";
                if (firstLine.includes('📋')) {
                    let cleaned = firstLine.replace('📋 ', '').trim();
                    if (cleaned.includes(' DU ')) {
                        let parts = cleaned.split(' DU ');
                        dateSub = parts[1].trim();
                    }
                }
                let isRegional = !!regionId && String(regionId).toUpperCase() !== 'FRA' && String(regionId).toUpperCase() !== 'METRO';
                
                let phenomCards = [];
                
                const getPhenomIcon = (name) => {
                    let n = name.toLowerCase();
                    if (n.includes('canicule') || n.includes('chaleur')) {
                        return `<svg viewBox="0 0 24 24" width="38" height="38" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/><path d="M12 9v2"/><path d="M12 12v.01"/></svg>`;
                    } else if (n.includes('forêt') || n.includes('foret') || n.includes('feux') || n.includes('incendie')) {
                        return `<svg viewBox="0 0 24 24" width="38" height="38" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c0 4-3 5-3 8a3 3 0 0 0 6 0c0-3-3-4-3-8Z"/><path d="M12 22a4 4 0 0 0 4-4c0-3-2-3-2-5"/></svg>`;
                    } else if (n.includes('orage')) {
                        return `<svg viewBox="0 0 24 24" width="38" height="38" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/><path d="m13 11-4 6h6l-4 6"/></svg>`;
                    } else if (n.includes('pluie') || n.includes('inondation') || n.includes('précipitation') || n.includes('averse')) {
                        return `<svg viewBox="0 0 24 24" width="38" height="38" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M16 13v8"/><path d="M8 13v8"/><path d="M12 15v8"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>`;
                    } else if (n.includes('crue') || n.includes('débordement')) {
                        return `<svg viewBox="0 0 24 24" width="38" height="38" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`;
                    } else if (n.includes('vent') || n.includes('tempête') || n.includes('rafale')) {
                        return `<svg viewBox="0 0 24 24" width="38" height="38" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`;
                    } else if (n.includes('neige') || n.includes('verglas') || n.includes('gel')) {
                        return `<svg viewBox="0 0 24 24" width="38" height="38" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="M12 2v20"/><path d="m4.93 4.93 14.14 14.14"/><path d="m19.07 4.93-14.14 14.14"/></svg>`;
                    } else if (n.includes('avalanche') || n.includes('montagne')) {
                        return `<svg viewBox="0 0 24 24" width="38" height="38" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`;
                    } else if (n.includes('submersion') || n.includes('vague') || n.includes('littoral')) {
                        return `<svg viewBox="0 0 24 24" width="38" height="38" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`;
                    } else if (n.includes('froid')) {
                        return `<svg viewBox="0 0 24 24" width="38" height="38" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/><path d="m20 4-4 4"/><path d="m16 4 4 4"/><path d="m20 12-4 4"/><path d="m16 12 4 4"/></svg>`;
                    } else {
                        return '';
                    }
                };
                // Check Rouge
                lines.filter(l => l.includes('🔴 Vigilance ROUGE')).forEach(l => {
                    let parts = l.split('–');
                    if (parts.length >= 2) {
                        let phenomName = parts[1].split(':')[0].trim();
                        let deptsStr = parts[1].split(':')[1] || "";
                        let count = deptsStr.split(/,| et /).filter(s => s.trim().length > 0).length;
                        if (count > 0) {
                            let detailText = isRegional && deptsStr.trim().length > 0 ? deptsStr.trim() : `${count} DÉPARTEMENT${count > 1 ? 'S' : ''}`;
                            phenomCards.push({
                                level: 'ROUGE', levelLabel: 'VIGILANCE ROUGE',
                                color: '#d32f2f', textColor: '#ffffff',
                                phenom: phenomName.toUpperCase(),
                                detail: detailText,
                                subDetail: null,
                                icon: getPhenomIcon(phenomName)
                            });
                        }
                    }
                });
                
                // Check Orange
                lines.filter(l => l.includes('🟠 Vigilance ORANGE')).forEach(l => {
                    let parts = l.split('–');
                    if (parts.length >= 2) {
                        let phenomName = parts[1].split(':')[0].trim();
                        let deptsStr = parts[1].split(':')[1] || "";
                        let count = deptsStr.split(/,| et /).filter(s => s.trim().length > 0).length;
                        if (count > 0) {
                            let detailText = isRegional && deptsStr.trim().length > 0 ? deptsStr.trim() : `${count} DÉPARTEMENT${count > 1 ? 'S' : ''}`;
                            phenomCards.push({
                                level: 'ORANGE', levelLabel: 'VIGILANCE ORANGE',
                                color: '#ff9800', textColor: '#ffffff',
                                phenom: phenomName.toUpperCase(),
                                detail: detailText,
                                subDetail: null,
                                icon: getPhenomIcon(phenomName)
                            });
                        }
                    }
                });
                
                // Check Jaune
                lines.filter(l => l.includes('🟡 Vigilance JAUNE')).forEach(l => {
                    let parts = l.split('–');
                    if (parts.length >= 2) {
                        let summaryStr = parts[1].trim().replace(/\\.$/, '');
                        let subParts = summaryStr.split(/, | et | ET /).filter(s => s.trim().length > 0);
                        subParts.forEach(part => {
                            part = part.trim();
                            if (part.length === 0) return;
                            let match = part.match(/^(.*?)\s+pour\s+(\d+)\s+département/i);
                            let mainPhenom = match ? match[1].toUpperCase() : part.toUpperCase();
                            let mainCount = match ? `${match[2]} DÉPARTEMENT${parseInt(match[2]) > 1 ? 'S' : ''}` : "";
                            
                            let detailText = mainCount;
                            if (isRegional) {
                                detailText = part;
                                if (detailText.toUpperCase().indexOf(mainPhenom.toUpperCase()) === 0) {
                                    let rem = detailText.substring(mainPhenom.length).replace(/^\s*-\s*|^\s*:\s*|^\s*pour\s+/i, 'pour ').trim();
                                    if (rem.length > 0) detailText = rem;
                                }
                            }
                            
                            phenomCards.push({
                                level: 'JAUNE', levelLabel: 'VIGILANCE JAUNE',
                                color: '#fbc02d', textColor: '#1e293b',
                                phenom: mainPhenom.trim(),
                                detail: detailText.trim(),
                                subDetail: null,
                                icon: getPhenomIcon(mainPhenom.trim())
                            });
                        });
                    }
                });
                
                if (phenomCards.length === 0) {
                    phenomCards.push({
                        level: 'VERT', levelLabel: 'SITUATION CALME',
                        color: '#22c55e', textColor: '#ffffff',
                        phenom: 'PAS DE VIGILANCE PARTICULIÈRE',
                        detail: '',
                        subDetail: null,
                        icon: getPhenomIcon('calme')
                    });
                }
                
                document.querySelectorAll('body > *, #root > *').forEach(e => {
                    e.style.display = 'none';
                });
                
                // Force 100% transparency on web page elements so omit_background=True works perfectly
                let style = document.createElement('style');
                style.innerHTML = `
                    html, body, #root, .app-layout, .main-content, .vigilance-container, .social-fb-container {
                        background: transparent !important;
                        background-color: transparent !important;
                        background-image: none !important;
                    }
                `;
                document.head.appendChild(style);
                 
                if (!regionId) {
                     // If it is the national map of France (not regional), make green departments transparent to avoid double outlines on VIGILANCE templates
                     let mapStyle = document.createElement('style');
                     mapStyle.innerHTML = `
                         svg.fb-svg-map path {
                             stroke: transparent !important;
                         }
                         svg.fb-svg-map path[fill="#34d399"]:not([data-dep="2A"]):not([data-dep="2B"]),
                         svg.fb-svg-map path[fill="#10b981"]:not([data-dep="2A"]):not([data-dep="2B"]),
                         svg.fb-svg-map path[fill="#22c55e"]:not([data-dep="2A"]):not([data-dep="2B"]),
                         svg.fb-svg-map path[fill="#34c759"]:not([data-dep="2A"]):not([data-dep="2B"]) {
                             fill: transparent !important;
                         }
                         svg.fb-svg-map path[data-dep="2A"][fill="#34d399"],
                         svg.fb-svg-map path[data-dep="2A"][fill="#10b981"],
                         svg.fb-svg-map path[data-dep="2A"][fill="#22c55e"],
                         svg.fb-svg-map path[data-dep="2A"][fill="#34c759"],
                         svg.fb-svg-map path[data-dep="2B"][fill="#34d399"],
                         svg.fb-svg-map path[data-dep="2B"][fill="#10b981"],
                         svg.fb-svg-map path[data-dep="2B"][fill="#22c55e"],
                         svg.fb-svg-map path[data-dep="2B"][fill="#34c759"] {
                             fill: #22c55e !important;
                             stroke: #1e293b !important;
                             stroke-width: 1.2px !important;
                         }
                         svg.fb-svg-map path[fill*="ff9"], 
                         svg.fb-svg-map path[fill*="ffa"], 
                         svg.fb-svg-map path[fill*="f97"],
                         svg.fb-svg-map path[fill*="fbc"],
                         svg.fb-svg-map path[fill*="ffc"],
                         svg.fb-svg-map path[fill*="eab"],
                         svg.fb-svg-map path[fill*="f59"],
                         svg.fb-svg-map path[fill*="ef4"],
                         svg.fb-svg-map path[fill*="d32"] {
                             stroke: rgba(0, 0, 0, 0.25) !important;
                             stroke-width: 1.5px !important;
                         }
                     `;
                     document.head.appendChild(mapStyle);
                 }
                
                let container = document.createElement('div');
                container.id = 'tv-studio-container';
                container.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: ${orientation === 'portrait' ? '1080px' : '1920px'};
                    height: ${orientation === 'portrait' ? '1920px' : '1080px'};
                    background: transparent !important;
                    display: flex;
                    flex-direction: ${orientation === 'portrait' ? 'column' : 'row'};
                    padding: ${orientation === 'portrait' ? '40px 40px 30px 40px' : '30px 45px 30px 45px'};
                    box-sizing: border-box;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    z-index: 9999999;
                    overflow: hidden;
                `;
                
                // NOTE: Legend card removed (`enlever le cadre en bas à gauche de la carte nationale`)
                
                 // Build Phenomenon Cards HTML (Grouped boxes matching "carte principale.png")
                 let rougeCards = phenomCards.filter(c => c.level === 'ROUGE');
                 let orangeCards = phenomCards.filter(c => c.level === 'ORANGE');
                 let jauneCards = phenomCards.filter(c => c.level === 'JAUNE');
                 
                 let groupedCards = [];
                 
                 // ROUGE alerts: separate boxes
                 rougeCards.forEach(c => {
                     groupedCards.push({
                         level: 'ROUGE',
                         color: c.color,
                         textColor: c.textColor,
                         levelLabel: c.levelLabel,
                         icon: c.icon,
                         phenom: c.phenom,
                         detail: c.detail,
                         subListText: ''
                     });
                 });
                 
                 // ORANGE alerts: separate boxes
                 orangeCards.forEach(c => {
                     groupedCards.push({
                         level: 'ORANGE',
                         color: c.color,
                         textColor: c.textColor,
                         levelLabel: c.levelLabel,
                         icon: c.icon,
                         phenom: c.phenom,
                         detail: c.detail,
                         subListText: ''
                     });
                 });
                 
                 // JAUNE alerts: grouped into a single box (sub-alerts listed underneath first alert)
                 if (jauneCards.length > 0) {
                     let first = jauneCards[0];
                     let subItems = [];
                     for (let i = 1; i < jauneCards.length; i++) {
                         let jc = jauneCards[i];
                         let subDetailClean = jc.detail.replace(/^(pour\s+|de\s+)/i, '');
                         subItems.push(`${jc.phenom.toUpperCase()} POUR ${subDetailClean.toUpperCase()}`);
                     }
                     groupedCards.push({
                         level: 'JAUNE',
                         color: first.color,
                         textColor: first.textColor,
                         levelLabel: first.levelLabel,
                         icon: first.icon,
                         phenom: first.phenom,
                         detail: first.detail,
                         subListText: subItems.join(', ')
                     });
                 }
                 
                 let cardsHtml = `<div style="display: flex; flex-direction: column; gap: ${orientation === 'portrait' ? '18px' : '14px'}; width: 100%;">`;
                 
                 groupedCards.forEach(c => {
                     let isYellowGroup = c.level === 'JAUNE' && c.subListText;
                     let boxBg = 'rgba(15, 23, 42, 0.85)';
                     let boxBorder = '1px solid rgba(255, 255, 255, 0.15)';
                     let cardPadding = orientation === 'portrait' ? '18px 24px' : '14px 22px';
                     let iconSize = orientation === 'portrait' ? '76px' : '72px';
                     let levelLabelSize = orientation === 'portrait' ? '16px' : '14px';
                     let phenomSize = orientation === 'portrait' ? '30px' : '25px';
                     let subListSize = orientation === 'portrait' ? '20px' : '16px';
                     let cleanDetail = c.detail.replace(/^(pour\s+|de\s+)/i, '');
                     
                     cardsHtml += `
                         <div style="background: ${boxBg}; border: ${boxBorder}; border-radius: 20px; padding: ${cardPadding}; display: flex; align-items: center; gap: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                             <!-- Left Icon Pill -->
                             <div style="width: ${iconSize}; height: ${iconSize}; border: 3px solid ${c.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${c.color}; background: rgba(0,0,0,0.4); flex-shrink: 0;">
                                 ${c.icon}
                             </div>
                             <!-- Middle text info -->
                             <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 6px;">
                                 <div>
                                     <span style="background: ${c.color}; color: ${c.textColor}; font-weight: 900; font-size: ${levelLabelSize}; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.8px;">
                                         ${c.levelLabel}
                                     </span>
                                 </div>
                                 <div style="color: #ffffff; font-weight: 800; font-size: ${phenomSize}; line-height: 1.2; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
                                     <span style="text-transform: uppercase;">${c.phenom}</span> : <span style="text-transform: uppercase; font-weight: 700; color: #cbd5e1;">${cleanDetail}</span>
                                 </div>
                                 ${isYellowGroup ? `
                                     <div style="color: #94a3b8; font-size: ${subListSize}; font-weight: 700; line-height: 1.35; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">
                                         ${c.subListText}
                                     </div>
                                 ` : ''}
                             </div>
                         </div>
                     `;
                 });
                 
                 if (groupedCards.length === 0) {
                     let phenomSize = orientation === 'portrait' ? '30px' : '23px';
                     cardsHtml += `
                         <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 20px; padding: ${orientation === 'portrait' ? '18px 24px' : '12px 18px'}; display: flex; align-items: center; gap: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                             <div style="width: ${orientation === 'portrait' ? '76px' : '64px'}; height: ${orientation === 'portrait' ? '76px' : '64px'}; border: 3px solid #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #22c55e; background: rgba(0,0,0,0.4); flex-shrink: 0; font-size: 24px;">
                                 🟢
                             </div>
                             <div style="color: #22c55e; font-weight: 900; font-size: ${phenomSize}; text-transform: uppercase; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
                                 Situation Calme : Pas de vigilance particulière
                             </div>
                         </div>
                     `;
                 }
                 cardsHtml += `</div>`;
                
                // Build Title HTML (Removed `VIGILANCE NORMANDIE` title when portrait/TikTok as requested: `enlever en haut le titre Vigilance Normandie par exemple`)
                const titleHtml = orientation === 'portrait' ? `
                    <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 30px;">
                        <div style="color: #60a5fa; font-weight: 800; font-size: 48px; letter-spacing: 1.5px; text-transform: uppercase; text-shadow: 0 4px 14px rgba(0,0,0,0.8);">
                            📋 ${dateSub}
                        </div>
                    </div>
                ` : `
                    <div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 24px;">
                        <div style="color: #ffffff; font-weight: 900; font-size: 48px; letter-spacing: 1px; text-transform: uppercase; text-shadow: 0 4px 14px rgba(0,0,0,0.75);">
                            VIGILANCE ${regionName === 'FRANCE' ? 'MÉTÉOROLOGIQUE' : regionName}
                        </div>
                        <div style="color: #fbc02d; font-weight: 800; font-size: 28px; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 6px;">
                            ${dateSub}
                        </div>
                    </div>
                `;
                
                if (orientation === 'portrait') {
                    if (!isRegional) {
                        // For France TikTok card: place Map FIRST (top), then Cards (bottom)
                        // We use absolute positioning to align the map exactly with the background pre-drawn ghost map
                        container.innerHTML = `
                            <!-- Title positioned at top -->
                            <div style="position: absolute; top: 120px; left: 0; width: 100%; display: flex; flex-direction: column; align-items: center; z-index: 20;">
                                ${titleHtml}
                            </div>
                            <!-- SVG Map positioned exactly over background ghost map [50, 480, 945, 1460] scaled to match [145, 465, 780, 780] -->
                            <div style="position: absolute; left: 145px; top: 465px; width: 780px; height: 780px; display: flex; align-items: center; justify-content: center; z-index: 10;">
                                <svg class="fb-svg-map" viewBox="${svgViewBox}" style="width: 100%; height: 100%; filter: drop-shadow(0 20px 35px rgba(0,0,0,0.75));">
                                    ${svgContent}
                                </svg>
                            </div>
                            <!-- Cards list positioned at bottom -->
                            <div style="position: absolute; bottom: 80px; left: 40px; width: 1000px; display: flex; justify-content: center; z-index: 20;">
                                ${cardsHtml}
                            </div>
                        `;
                    } else {
                        // For regional TikTok cards (HDF, Normandie, etc.): keep Cards at top, Map at bottom (since there are few cards)
                        let mapHeight = '920px';
                        let mapMarginTop = '110px';
                        let mapMarginBottom = '20px';
                        if (phenomCards.length > 5) {
                            mapHeight = '480px';
                            mapMarginTop = '40px';
                        } else if (phenomCards.length > 3) {
                            mapHeight = '680px';
                            mapMarginTop = '60px';
                        }
                        
                        container.innerHTML = `
                            <div style="width: 100%; display: flex; flex-direction: column; align-items: center; margin-top: 30px; margin-bottom: 25px;">
                                ${titleHtml}
                            </div>
                            <div style="width: 100%; margin-bottom: 40px; padding: 0 15px; box-sizing: border-box;">
                                ${cardsHtml}
                            </div>
                            <div style="width: 100%; height: ${mapHeight}; position: relative; display: flex; align-items: center; justify-content: center; margin-top: ${mapMarginTop}; margin-bottom: ${mapMarginBottom};">
                                <svg viewBox="${svgViewBox}" style="max-width: 100%; max-height: 100%; filter: drop-shadow(0 20px 35px rgba(0,0,0,0.7));">
                                    ${svgContent}
                                </svg>
                            </div>
                        `;
                    }
                } else {
                    if (!isRegional) {
                        // France Landscape Layout: Map positioned exactly over background ghost map [180, 170, 740, 880] -> [40, 20, 920, 1000]
                        // ponytail: top shifted 50->20 and height 920->1000 so Corsica (SVG bottom) is not clipped
                        container.innerHTML = `
                            <!-- SVG Map positioned exactly over background ghost map -->
                            <div style="position: absolute; left: 40px; top: 20px; width: 920px; height: 1000px; display: flex; align-items: center; justify-content: center; z-index: 10;">
                                <svg class="fb-svg-map" viewBox="${svgViewBox}" style="width: 100%; height: 100%; filter: drop-shadow(0 20px 35px rgba(0,0,0,0.75));">
                                    ${svgContent}
                                </svg>
                            </div>
                            <!-- Title & Date positioned on the right -->
                            <div style="position: absolute; left: 1040px; top: 120px; width: 820px; display: flex; flex-direction: column; z-index: 20;">
                                ${titleHtml}
                            </div>
                            <!-- Cards list positioned on the right -->
                            <div style="position: absolute; left: 1040px; top: 320px; width: 820px; display: flex; flex-direction: column; z-index: 20;">
                                ${cardsHtml}
                            </div>
                        `;
                    } else {
                        // Regional Landscape Layout: standard split row layout
                        container.innerHTML = `
                            <div style="width: 55%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; padding-right: 20px;">
                                <svg viewBox="${svgViewBox}" style="max-width: 100%; max-height: 100%; filter: drop-shadow(0 20px 35px rgba(0,0,0,0.7));">
                                    ${svgContent}
                                </svg>
                            </div>
                            <div style="width: 45%; height: 100%; display: flex; flex-direction: column; justify-content: center; padding-left: 20px; box-sizing: border-box;">
                                ${titleHtml}
                                ${cardsHtml}
                            </div>
                        `;
                    }
                }
                
                document.body.appendChild(container);
            }''', {"orientation": orientation, "regionId": region_id})
            
            # After injecting our custom container, resize the viewport to the final target size
            # (1920x1080 for landscape) before taking the screenshot.
            if orientation == "landscape":
                page.set_viewport_size({"width": 1920, "height": 1080})
            time.sleep(0.3)
            
            # Prendre la capture au format exact du viewport et l'appliquer sur le fond CNews
            page.screenshot(path=temp_png, omit_background=True)
            browser.close()
            success = True
    except Exception as e:
        log(f"Erreur lors de la capture Playwright vigilance: {e}")
        return False
        
    if success and os.path.exists(temp_png):
        try:
            if orientation == "portrait":
                v_width, v_height = 1080, 1920
                template_names = ["VIGILANCE PORTRAIT.png", "AVANT PREVI 010.png", "AVANT METEO 010.png"]
            else:
                v_width, v_height = 1920, 1080
                template_names = ["VIGILANCE PAYSAGE.png", "AVANT PREVI 009.png", "AVANT METEO 009.png"]
                
            cartes_dir = os.path.dirname(output_path)
            script_dir = os.path.dirname(os.path.abspath(__file__))
            for name in template_names:
                p_script = os.path.join(script_dir, "A_CONSERVER_ABSOLUMENT", name)
                p1 = os.path.join(cartes_dir, "A_CONSERVER_ABSOLUMENT", name)
                p2 = os.path.join(cartes_dir, name)
                p3 = os.path.join(r"C:\Users\grego\Desktop\cartes_alertes", name)
                p4 = os.path.join(r"C:\Users\grego\Desktop\cartes_alertes\A_CONSERVER_ABSOLUMENT", name)
                p5 = os.path.join(r"C:\Users\grego\Documents\METEO_CLIMAT\meteo cnews 2", name)
                for p_check in [p_script, p1, p2, p3, p4, p5]:
                    if os.path.exists(p_check):
                        template_path = p_check
                        break
                if template_path:
                    break
                
            if template_path and os.path.exists(template_path):
                log(f"Composition sur le fond officiel : {template_path}")
                bg = Image.open(template_path).convert("RGBA").resize((v_width, v_height), Image.Resampling.LANCZOS)
            else:
                log(f"Warning: fond non trouve, utilisation d'un fond bleu nuit.")
                bg = Image.new("RGBA", (v_width, v_height), (2, 7, 18, 255))
                
            card_img = Image.open(temp_png).convert("RGBA")
            # Superposer à (0, 0) car card_img est exactement de taille v_width x v_height
            bg.paste(card_img, (0, 0), card_img)
            bg.convert("RGB").save(output_path, "JPEG", quality=95)
            log(f"Carte de vigilance CNews TV Studio générée avec succès : {output_path}")
            
            if os.path.exists(temp_png):
                os.remove(temp_png)
            return True
        except Exception as e:
            log(f"Erreur lors de la composition de l'image vigilance: {e}")
            return False
            
    return False


def capture_and_compose_forets(zone, orientation, output_path):
    """Télécharge l'image de Vigilance Météo des Forêts de demain générée par Supabase
    pour la zone correspondante, et l'enregistre brute pour préserver son ratio d'aspect."""
    import urllib.request
    import shutil
    
    # Mapping des zones avec les fichiers Supabase régionaux correspondants
    urls_mapping = {
        "france_pictos": "https://ubdevaemtwbzxksjlhjg.supabase.co/storage/v1/object/public/vigilance-captures/vigilance_foret_tomorrow.png",
        "ara": "https://ubdevaemtwbzxksjlhjg.supabase.co/storage/v1/object/public/vigilance-captures/vigilance_foret_region_ARA_tomorrow.png",
        "bfc": "https://ubdevaemtwbzxksjlhjg.supabase.co/storage/v1/object/public/vigilance-captures/vigilance_foret_region_BFC_tomorrow.png",
        "bretagne": "https://ubdevaemtwbzxksjlhjg.supabase.co/storage/v1/object/public/vigilance-captures/vigilance_foret_region_BRE_tomorrow.png",
        "cvl": "https://ubdevaemtwbzxksjlhjg.supabase.co/storage/v1/object/public/vigilance-captures/vigilance_foret_region_CVL_tomorrow.png",
        "corse": "https://ubdevaemtwbzxksjlhjg.supabase.co/storage/v1/object/public/vigilance-captures/vigilance_foret_region_COR_tomorrow.png",
        "grandest": "https://ubdevaemtwbzxksjlhjg.supabase.co/storage/v1/object/public/vigilance-captures/vigilance_foret_region_GES_tomorrow.png",
        "hdf": "https://ubdevaemtwbzxksjlhjg.supabase.co/storage/v1/object/public/vigilance-captures/vigilance_foret_region_HDF_tomorrow.png",
        "idf": "https://ubdevaemtwbzxksjlhjg.supabase.co/storage/v1/object/public/vigilance-captures/vigilance_foret_region_IDF_tomorrow.png",
        "normandie": "https://ubdevaemtwbzxksjlhjg.supabase.co/storage/v1/object/public/vigilance-captures/vigilance_foret_region_NOR_tomorrow.png",
        "naq": "https://ubdevaemtwbzxksjlhjg.supabase.co/storage/v1/object/public/vigilance-captures/vigilance_foret_region_NAQ_tomorrow.png",
        "occitanie": "https://ubdevaemtwbzxksjlhjg.supabase.co/storage/v1/object/public/vigilance-captures/vigilance_foret_region_OCC_tomorrow.png",
        "pdl": "https://ubdevaemtwbzxksjlhjg.supabase.co/storage/v1/object/public/vigilance-captures/vigilance_foret_region_PDL_tomorrow.png",
        "paca": "https://ubdevaemtwbzxksjlhjg.supabase.co/storage/v1/object/public/vigilance-captures/vigilance_foret_region_PAC_tomorrow.png"
    }
    
    # Récupérer l'URL dédiée ou se rabattre sur la nationale
    supabase_url = urls_mapping.get(zone, urls_mapping["france_pictos"])
    log(f"Téléchargement direct de la carte Vigilance Forêts depuis Supabase (Zone: {zone}) : {supabase_url}")

    temp_png = output_path.replace(".jpg", "_temp.png")

    try:
        # Téléchargement direct
        urllib.request.urlretrieve(supabase_url, temp_png)
        success = True
    except Exception as e:
        log(f"Erreur lors du téléchargement de l'image forêts régionale depuis Supabase ({zone}): {e}")
        return False

    if success and os.path.exists(temp_png):
        try:
            shutil.copyfile(temp_png, output_path)
            log(f"Carte Risque Feux de Forêt régionale ({zone}) sauvegardée sans déformation : {output_path}")

            if os.path.exists(temp_png):
                os.remove(temp_png)
            return True
        except Exception as e:
            log(f"Erreur lors de la copie de l'image forêts régionale: {e}")
            return False

    return False


def generate_video(zone, days, orientation, temp_highlight=False, skip_maps=False, patrick=False):
    if patrick:
        temp_highlight = True
    log(f"Démarrage de la génération vidéo pour la zone '{zone}' (jours: {days}, format: {orientation}, patrick: {patrick})")
    
    # === ÉTAPE 0 : Régénérer les cartes Météo-France fraîches avant compilation ===
    if not skip_maps:
        maps_script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "generate_meteofrance_maps.py")
        if os.path.exists(maps_script):
            log(f"Récupération des prévisions Météo-France en cours (données fraîches)...")
            maps_cmd = [sys.executable, maps_script, "--zone", zone, "--days", str(days), "--orientation", orientation]
            if temp_highlight:
                maps_cmd.append("--temp-highlight")
            if patrick:
                maps_cmd.append("--patrick")
            result = subprocess.run(maps_cmd, capture_output=False)  # Affiche la progression en temps réel
            if result.returncode != 0:
                log(f"Erreur lors de la génération des cartes Météo-France (code {result.returncode}). Abandon.")
                sys.exit(1)
            log(f"Cartes Météo-France régénérées avec succès. Compilation vidéo en cours...")
        else:
            log(f"Avertissement: generate_meteofrance_maps.py introuvable à {maps_script}. Utilisation des cartes existantes.")
    else:
        log("Option --skip-maps active : utilisation des cartes existantes sans régénération.")
    
    # Répertoires
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, ".."))
    cartes_dir = os.path.join(project_root, "cartes_alertes")
    if not os.path.exists(cartes_dir):
        cartes_dir = os.path.expanduser(r"~\Desktop\cartes_alertes")
        
    temp_dir = os.path.join(cartes_dir, f"temp_transitions_period_{os.getpid()}")
    if os.path.exists(temp_dir):
        safe_rmtree(temp_dir)
    os.makedirs(temp_dir)
    
    # Paramètres de format
    if orientation == "portrait":
        jingle_name = "jingle_tiktok.mp4"
        suffix = "_portrait"
        width, height = 1080, 1920  # TikTok standard (cartes portrait: 1593x2880 → downscale propre)
        if patrick:
            out_filename = f"bulletin_{zone}_patrick_portrait.mp4"
        else:
            out_filename = f"bulletin_{zone}_portrait.mp4"
    else:
        jingle_name = "jingle_facebook.mp4"
        suffix = ""
        width, height = 1920, 1080  # Full HD 1920x1080 (broadcast + réseaux sociaux)
        if patrick:
            out_filename = f"bulletin_{zone}_patrick_landscape.mp4"
        else:
            out_filename = f"bulletin_{zone}_landscape.mp4"
        
    assets_dir = os.path.join(script_dir, "A_CONSERVER_ABSOLUMENT")
    if not os.path.exists(assets_dir):
        assets_dir = os.path.join(cartes_dir, "A_CONSERVER_ABSOLUMENT")
        
    jingle_path = os.path.join(assets_dir, jingle_name)
    music_path = os.path.join(assets_dir, "musique de fond.mp3")
    logo_path = os.path.join(assets_dir, "logo meteo climat pro 3.png")
    output_path = os.path.join(cartes_dir, out_filename)
    
    # Vérifications des fichiers de base
    if not os.path.exists(jingle_path):
        log(f"Erreur: Jingle introuvable à {jingle_path}")
        sys.exit(1)
    if not os.path.exists(music_path):
        log(f"Erreur: Musique de fond introuvable à {music_path}")
        sys.exit(1)
        
    # Déterminer la durée du jingle
    try:
        jingle_duration = get_video_duration(jingle_path)
    except Exception as e:
        jingle_duration = 8.0
        
    # Noms des mois et des jours
    months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
    days_of_week = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    # Les bulletins commencent toujours à J+1 (demain)
    today = datetime.date.today() + datetime.timedelta(days=1)
    
    # 1. Construire la liste ordonnée des inputs et leurs durées (plaque de transition 3.0s, carte météo 4.0s)
    inputs_list = []
    
    # === ÉTAPE 0.5 : Récupérer et insérer la diapositive de vigilance (J+1) au début ===
    vigilance_file = f"carte_vigilance_{zone}{suffix}.jpg"
    vigilance_path = os.path.join(cartes_dir, vigilance_file)
    capture_and_compose_vigilance(zone, orientation, vigilance_path)
    if os.path.exists(vigilance_path):
        prefix_trans = f"trans_vigilance{suffix}"
        if zone == "france_pictos":
            title = "VIGILANCE MÉTÉO"
            subtitle = "MÉTÉO-FRANCE"
        else:
            title = "VIGILANCE RÉGIONALE"
            subtitle = ZONE_LABELS.get(zone, "MÉTÉO-FRANCE")
        create_transition_frames(title, subtitle, width, height, logo_path, temp_dir, prefix_trans)
        trans_pattern = os.path.join(temp_dir, f"{prefix_trans}_frame_%03d.jpg")
        inputs_list.append((trans_pattern, 3.0, True))
        inputs_list.append((vigilance_path, 7.0, False))
    
    # Périodes
    if patrick:
        patrick_slides = [
            (0, 'matin', 'MATIN'),
            (0, 'apresmidi', 'APRÈS-MIDI'),
            (0, 'precip', 'CUMULS DE PRÉCIPITATIONS'),
            (0, 'gusts', 'RAFALES MAXIMALES'),
            (1, 'apresmidi', 'APRÈS-MIDI'),
            (2, 'apresmidi', 'APRÈS-MIDI'),
            (3, 'apresmidi', 'APRÈS-MIDI'),
            (4, 'apresmidi', 'APRÈS-MIDI')
        ]
        
        for d, period_key, period_label in patrick_slides:
            target_date = today + datetime.timedelta(days=d)
            day_name = days_of_week[target_date.weekday()].upper()
            date_str = f"{day_name} {target_date.day} {months[target_date.month - 1].upper()}"
            
            if zone == "france_pictos":
                map_file_t1 = f"carte_J{d+1}_{period_key}{suffix}.jpg"
                map_file_t0 = f"carte_J{d}_{period_key}{suffix}.jpg"
            else:
                map_file_t1 = f"carte_{zone}_J{d+1}_{period_key}{suffix}.jpg"
                map_file_t0 = f"carte_{zone}_J{d}_{period_key}{suffix}.jpg"
                
            map_path_t1 = os.path.join(cartes_dir, map_file_t1)
            map_path_t0 = os.path.join(cartes_dir, map_file_t0)
            
            map_path = None
            actual_day_str = None
            
            if os.path.exists(map_path_t1):
                map_path = map_path_t1
                actual_day_str = f"J{d+1}"
            elif os.path.exists(map_path_t0):
                map_path = map_path_t0
                actual_day_str = f"J{d}"
            elif d == 4:  # Fallback J+5 vers J+4
                if zone == "france_pictos":
                    fallback_file_t1 = f"carte_J4_{period_key}{suffix}.jpg"
                    fallback_file_t0 = f"carte_J3_{period_key}{suffix}.jpg"
                else:
                    fallback_file_t1 = f"carte_{zone}_J4_{period_key}{suffix}.jpg"
                    fallback_file_t0 = f"carte_{zone}_J3_{period_key}{suffix}.jpg"
                
                fb_path_t1 = os.path.join(cartes_dir, fallback_file_t1)
                fb_path_t0 = os.path.join(cartes_dir, fallback_file_t0)
                
                if os.path.exists(fb_path_t1):
                    map_path = fb_path_t1
                    actual_day_str = "J4"
                    target_date = today + datetime.timedelta(days=3)
                    day_name = days_of_week[target_date.weekday()].upper()
                    date_str = f"{day_name} {target_date.day} {months[target_date.month - 1].upper()}"
                elif os.path.exists(fb_path_t0):
                    map_path = fb_path_t0
                    actual_day_str = "J3"
                    target_date = today + datetime.timedelta(days=2)
                    day_name = days_of_week[target_date.weekday()].upper()
                    date_str = f"{day_name} {target_date.day} {months[target_date.month - 1].upper()}"
            
            if map_path:
                prefix = f"trans_{actual_day_str}_{period_key}{suffix}"
                create_transition_frames(date_str, period_label, width, height, logo_path, temp_dir, prefix)
                trans_pattern = os.path.join(temp_dir, f"{prefix}_frame_%03d.jpg")
                
                inputs_list.append((trans_pattern, 3.0, True))
                inputs_list.append((map_path, 7.0, False))
    else:
        periods_info = [
            ("matin", "MATIN"),
            ("apresmidi", "APRÈS-MIDI"),
            ("soiree", "SOIRÉE")
        ]
        
        for d in range(days):
            target_date = today + datetime.timedelta(days=d)
            day_name = days_of_week[target_date.weekday()].upper()
            date_str = f"{day_name} {target_date.day} {months[target_date.month - 1].upper()}"
            
            for period_key, period_label in periods_info:
                if zone == "france_pictos":
                    map_file_t1 = f"carte_J{d+1}_{period_key}{suffix}.jpg"
                    map_file_t0 = f"carte_J{d}_{period_key}{suffix}.jpg"
                else:
                    map_file_t1 = f"carte_{zone}_J{d+1}_{period_key}{suffix}.jpg"
                    map_file_t0 = f"carte_{zone}_J{d}_{period_key}{suffix}.jpg"
                
                map_path_t1 = os.path.join(cartes_dir, map_file_t1)
                map_path_t0 = os.path.join(cartes_dir, map_file_t0)
                
                if os.path.exists(map_path_t1):
                    map_path = map_path_t1
                    actual_day_str = f"J{d+1}"
                elif os.path.exists(map_path_t0):
                    map_path = map_path_t0
                    actual_day_str = f"J{d}"
                else:
                    map_path = None
                    
                if map_path:
                    prefix = f"trans_{actual_day_str}_{period_key}{suffix}"
                    create_transition_frames(date_str, period_label, width, height, logo_path, temp_dir, prefix)
                    trans_pattern = os.path.join(temp_dir, f"{prefix}_frame_%03d.jpg")
                    
                    inputs_list.append((trans_pattern, 3.0, True))
                    inputs_list.append((map_path, 7.0, False))
                
    # Ajouter l'Éphéméride à la fin
    if zone == "france_pictos":
        eph_file = f"carte_ephemeride{suffix}.jpg"
    else:
        eph_file = f"carte_{zone}_ephemeride{suffix}.jpg"
    eph_path = os.path.join(cartes_dir, eph_file)
    
    if os.path.exists(eph_path):
        day_name = days_of_week[today.weekday()].upper()
        date_str = f"{day_name} {today.day} {months[today.month - 1].upper()}"
        prefix = f"trans_ephemeride{suffix}"
        create_transition_frames(date_str, "L'ÉPHÉMÉRIDE", width, height, logo_path, temp_dir, prefix)
        trans_pattern = os.path.join(temp_dir, f"{prefix}_frame_%03d.jpg")
        
        inputs_list.append((trans_pattern, 3.0, True))
        inputs_list.append((eph_path, 7.0, False))
        
    num_inputs = len(inputs_list)
    if num_inputs == 0:
        log("Erreur: Aucune image météo trouvée pour la compilation.")
        sys.exit(1)
        
    # Calculs de minutage
    # Durée totale du diaporama = somme(durées) - (num_inputs - 1) * xfade_duration
    xfade_duration = 0.4
    total_raw_duration = sum(d for _, d, _ in inputs_list)
    slideshow_duration = total_raw_duration - (num_inputs - 1) * xfade_duration
    
    jingle_cut_start = 0.5
    jingle_trimmed_duration = jingle_duration - jingle_cut_start
    jingle_to_slide_offset = jingle_trimmed_duration - 1.0
    
    music_delay_ms = int(jingle_to_slide_offset * 1000)
    music_fade_in_start = jingle_to_slide_offset
    music_fade_out_start = jingle_to_slide_offset + slideshow_duration - 3.0
    
    log(f"Nombre total d'éléments animés: {num_inputs} (durée diaporama: {slideshow_duration}s)")
    log(f"Transition Jingle -> Diaporama calée à {jingle_to_slide_offset}s")
    
    # Entrées de la commande FFmpeg
    inputs_cmd = []
    # 0. Jingle
    inputs_cmd.extend(["-i", jingle_path])
    # 1..N. Diaporama (Alternance plaque période et cartes météo)
    for path, duration, is_seq in inputs_list:
        if is_seq:
            inputs_cmd.extend(["-f", "image2", "-framerate", "24", "-i", path])
        else:
            inputs_cmd.extend(["-loop", "1", "-t", str(duration), "-i", path])
    # N+1. Musique de fond
    inputs_cmd.extend(["-i", music_path])
    
    # Filter Complex Construction
    # 1. Recadrer et forcer le framerate et la base de temps du jingle, avec fondu d'entrée + nom région
    region_label = "BULLETIN NATIONAL" if zone == "france_pictos" else ZONE_LABELS.get(zone)
    if region_label:
        # Calibrage dynamique de la taille de police pour éviter le dépassement de l'écran
        if width > height:
            # Landscape
            max_width = width * 0.8
            font_size = min(85, int(max_width / (len(region_label) * 0.6)))
            text_y = 130
        else:
            # Portrait (TikTok)
            max_width = width * 0.85
            font_size = min(100, int(max_width / (len(region_label) * 0.6)))
            text_y = 80
            
        drawtext = (
            f"drawtext=fontfile='C\\:/Windows/Fonts/arialbd.ttf':"
            f"text='{region_label}':"
            f"fontsize={font_size}:"
            f"fontcolor=white:"
            f"x=(w-text_w)/2:"
            f"y={text_y}:"
            f"box=1:"
            f"boxcolor=0x050F2D@0.75:"
            f"boxborderw=30"
        )
        filter_jingle = (
            f"[0:v]trim=start={jingle_cut_start}:end={jingle_duration},setpts=PTS-STARTPTS,"
            f"scale={width}:{height},format=yuv420p,setsar=1,fps=fps=24,settb=1/24,"
            f"{drawtext}[jingle_v];"
            f"[0:a]atrim=start={jingle_cut_start}:end={jingle_duration},asetpts=PTS-STARTPTS,volume=1.0[jingle_a];"
        )
    else:
        filter_jingle = (
            f"[0:v]trim=start={jingle_cut_start}:end={jingle_duration},setpts=PTS-STARTPTS,"
            f"scale={width}:{height},format=yuv420p,setsar=1,fps=fps=24,settb=1/24[jingle_v];"
            f"[0:a]atrim=start={jingle_cut_start}:end={jingle_duration},asetpts=PTS-STARTPTS,volume=1.0[jingle_a];"
        )

    filter_scale = ""
    for i in range(1, num_inputs + 1):
        filter_scale += f"[{i}:v]scale={width}:{height},format=yuv420p,setsar=1,fps=fps=24,settb=1/24[v{i}];"
        
    # 3. Appliquer les transitions xfade (fondu rapide et propre de 0.4s pour éviter le chevauchement du texte)
    xfade_duration = 0.4
    filter_xfade = ""
    last_label = "[v1]"
    current_offset = 0.0
    for i in range(num_inputs - 1):
        current_offset += inputs_list[i][1] - xfade_duration
        next_label = f"[x{i+1}]"
        if i == num_inputs - 2:
            next_label = "[slideshow_v]"
        filter_xfade += f"{last_label}[v{i+2}]xfade=transition=fade:duration={xfade_duration}:offset={current_offset:.2f},settb=1/24{next_label};"
        last_label = next_label
        
    # Si une seule image (théorique)
    if num_inputs == 1:
        filter_xfade = "[v1]copy[slideshow_v];"
        
    # 4. Transition (crossfade de 1.0s) entre le jingle et le diaporama
    filter_transition = f"[jingle_v][slideshow_v]xfade=transition=fade:duration=1.0:offset={jingle_to_slide_offset:.2f},settb=1/24[v];"
    
    # 5. Retarder la musique de fond et lui appliquer fondu entrant/sortant
    music_idx = num_inputs + 1
    filter_music = (
        f"[{music_idx}:a]volume=0.25,adelay={music_delay_ms}|{music_delay_ms},"
        f"afade=t=in:st={music_fade_in_start:.2f}:d=0.5,"
        f"afade=t=out:st={music_fade_out_start:.2f}:d=3.0[music_ready];"
    )
    
    # 6. Mixer l'audio du jingle et la musique de fond (normalize=0 pour conserver le plein volume du jingle)
    filter_audio_mix = f"[jingle_a][music_ready]amix=inputs=2:duration=longest:dropout_transition=0:normalize=0[a]"
    
    filter_complex_str = filter_jingle + filter_scale + filter_xfade + filter_transition + filter_music + filter_audio_mix

    # Écriture du filter_complex dans un fichier pour éviter tout problème d'échappement
    filter_script_path = os.path.join(temp_dir, "filter_complex.txt")
    with open(filter_script_path, "w", encoding="utf-8") as f:
        f.write(filter_complex_str)

    ffmpeg_cmd = [
        "ffmpeg", "-y"
    ] + inputs_cmd + [
        "-filter_complex_script", filter_script_path,
        "-map", "[v]",
        "-map", "[a]",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-r", "24",
        "-shortest",
        output_path
    ]
    
    # Diagnostic print of temp files
    if os.path.exists(temp_dir):
        files = os.listdir(temp_dir)
        log(f"[DIAG] Nombre de fichiers dans temp_dir : {len(files)}")
        prefixes = sorted(list(set([f.split('_frame_')[0] for f in files if '_frame_' in f])))
        log(f"[DIAG] Prefixes existants : {prefixes}")
        vig_files = sorted([f for f in files if f.startswith('trans_vigilance')])
        log(f"[DIAG] Fichiers vigilance : {len(vig_files)} (de {vig_files[0] if vig_files else 'None'} à {vig_files[-1] if vig_files else 'None'})")

    log("Lancement de la compilation vidéo avec plaques de transition périodiques et ralentissement...")
    try:
        subprocess.run(ffmpeg_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        log(f"✅ Succès ! Bulletin vidéo généré : {output_path}")
    except subprocess.CalledProcessError as e:
        log(f"Erreur lors de la compilation FFmpeg : {e.stderr.decode('utf-8', errors='ignore')}")
        if os.path.exists(temp_dir):
            safe_rmtree(temp_dir)
        sys.exit(1)
        
    # Nettoyage temporaire des plaques de transition
    if os.path.exists(temp_dir):
        safe_rmtree(temp_dir)
    log("🧹 Nettoyage des plaques de transition périodiques terminées.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Météo CNews - Générateur de clip vidéo bulletin avec plaques périodiques")
    parser.add_argument("--zone", default="hdf", help="Code de la zone/région (ex: hdf)")
    parser.add_argument("--days", type=int, default=3, help="Nombre de jours de prévisions")
    parser.add_argument("--orientation", default="landscape", choices=["landscape", "portrait", "square"], help="Orientation")
    parser.add_argument("--temp-highlight", action="store_true", help="Mise en avant min/max des températures (bleu min, rouge max, noir pour le reste)")
    parser.add_argument("--skip-maps", action="store_true", help="Passer la régénération des cartes (utiliser les fichiers existants)")
    parser.add_argument("--patrick", action="store_true", help="Compiler le Bulletin Patrick")
    
    args = parser.parse_args()
    days_val = max(args.days, 5) if args.patrick else args.days
    generate_video(args.zone, days_val, args.orientation, args.temp_highlight, args.skip_maps, patrick=args.patrick)
