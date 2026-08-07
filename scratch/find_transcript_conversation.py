import os
import glob
import json

db_folder = r"C:\Users\grego\.gemini\antigravity\conversations"
brain_folder = r"C:\Users\grego\.gemini\antigravity\brain"

# Récupérer les IDs de conversation
db_files = glob.glob(os.path.join(db_folder, "*.db"))
conversation_ids = [os.path.splitext(os.path.basename(f))[0] for f in db_files]

print(f"Analyse de {len(conversation_ids)} conversations possibles...")

matches = []

for cid in conversation_ids:
    transcript_path = os.path.join(brain_folder, cid, ".system_generated", "logs", "transcript.jsonl")
    if not os.path.exists(transcript_path):
        continue
        
    try:
        with open(transcript_path, 'r', encoding='utf-8') as f:
            for line_no, line in enumerate(f, 1):
                if not line.strip():
                    continue
                try:
                    data = json.loads(line)
                    # Chercher dans le contenu textuel de la step
                    content = str(data.get('content', ''))
                    
                    # Chercher aussi dans les tool calls si c'est du code
                    tool_calls_str = ""
                    for tc in data.get('tool_calls', []):
                        tool_calls_str += str(tc)
                    
                    full_text = (content + " " + tool_calls_str).lower()
                    
                    if 'orage' in full_text or 'foudre' in full_text or 'fond blanc' in full_text:
                        # Extraire le type de step et le timestamp ou date
                        step_type = data.get('type', '')
                        source = data.get('source', '')
                        
                        # Récupérer la date de modification du fichier de log
                        mtime = os.path.getmtime(transcript_path)
                        import datetime
                        date_str = datetime.datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
                        
                        # Si on cherche spécifiquement la période de fin juin / début juillet
                        matches.append({
                            'cid': cid,
                            'date': date_str,
                            'line_no': line_no,
                            'source': source,
                            'type': step_type,
                            'snippet': content[:200].strip()
                        })
                except Exception as e:
                    pass
    except Exception as e:
        # print(f"Erreur lecture {cid}: {e}")
        pass

# Trier les correspondances par date
matches.sort(key=lambda x: x['date'])

print(f"\nTotal de correspondances trouvées : {len(matches)}")
print("\nListe des conversations traitant d'orages/foudre par date :")
last_cid = None
for m in matches:
    # Filtrer pour se concentrer sur juin/juillet 2026
    if '2026-06' in m['date'] or '2026-07' in m['date']:
        if m['cid'] != last_cid:
            print(f"\n📂 Conversation ID: {m['cid']} (Modifié le: {m['date']})")
            last_cid = m['cid']
        print(f"   - Ligne {m['line_no']} [{m['source']}/{m['type']}]: {m['snippet'][:120]}...")
