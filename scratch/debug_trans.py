import sys
import os

sys.path.append(r"C:\Users\grego\Documents\METEO_CLIMAT\meteo cnews 2")
from generate_video_bulletin import create_transition_frames

logo_path = r"C:\Users\grego\Desktop\cartes_alertes\A_CONSERVER_ABSOLUMENT\logo meteo climat pro 3.png"
temp_dir = r"C:\Users\grego\Desktop\cartes_alertes\temp_transitions_period"

# Clean temp dir first
for f in os.listdir(temp_dir):
    try:
        os.remove(os.path.join(temp_dir, f))
    except:
        pass

print("Calling create_transition_frames for gusts...")
res = create_transition_frames(
    "VENDREDI 10 JUILLET 2026", 
    "RAFALES MAXIMALES", 
    1920, 
    1080, 
    logo_path, 
    temp_dir, 
    "trans_J1_gusts"
)
print("Result:", res)

# Check what was written
files = sorted(os.listdir(temp_dir))
print(f"Total files written: {len(files)}")
if len(files) < 72:
    print("Missing files! List of written files:")
    print(files)
else:
    print("All 72 files written successfully!")
