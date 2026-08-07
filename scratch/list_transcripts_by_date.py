import os
import glob
import datetime

db_folder = r"C:\Users\grego\.gemini\antigravity\conversations"
brain_folder = r"C:\Users\grego\.gemini\antigravity\brain"

db_files = glob.glob(os.path.join(db_folder, "*.db"))
conversation_ids = [os.path.splitext(os.path.basename(f))[0] for f in db_files]

transcripts = []

for cid in conversation_ids:
    transcript_path = os.path.join(brain_folder, cid, ".system_generated", "logs", "transcript.jsonl")
    if os.path.exists(transcript_path):
        mtime = os.path.getmtime(transcript_path)
        mtime_date = datetime.datetime.fromtimestamp(mtime)
        transcripts.append((cid, mtime_date, transcript_path))

# Trier par date
transcripts.sort(key=lambda x: x[1])

print(f"Trouvé {len(transcripts)} fichiers transcripts au total.")
print("Liste ordonnée par date de modification :")
for cid, mdate, path in transcripts:
    # On affiche tout, notamment ceux de juin
    print(f"- {mdate.strftime('%Y-%m-%d %H:%M:%S')} : {cid} (Taille: {os.path.getsize(path)} octets)")
