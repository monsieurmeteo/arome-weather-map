with open('generate_meteociel_obs_maps.py', 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        # Print lines that draw text or load fonts or backgrounds
        if any(k in line for k in ['ImageFont.truetype', 'bg_landscape', 'bg_portrait', '.text(']):
            print(f"{idx+1}: {line.strip()}")
