import sqlite3
import glob
import os
import datetime

db_folder = r"C:\Users\grego\.gemini\antigravity\conversations"
db_files = glob.glob(os.path.join(db_folder, "*.db"))

print(f"Trouvé {len(db_files)} fichiers de base de données à analyser...")

for db in db_files:
    basename = os.path.basename(db)
    try:
        conn = sqlite3.connect(db)
        cursor = conn.cursor()
        
        # Trouver les tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [t[0] for t in cursor.fetchall()]
        
        # Chercher dans les tables potentielles
        for table in tables:
            # Récupérer les colonnes pour voir si on a du texte ou des dates
            cursor.execute(f"PRAGMA table_info({table});")
            cols = [c[1] for c in cursor.fetchall()]
            
            # Chercher une colonne de contenu textuel
            text_cols = [c for c in cols if c in ['content', 'text', 'message', 'body', 'prompt', 'value', 'data', 'prompt_text']]
            if not text_cols:
                # Si aucune colonne standard, on cherche n'importe quelle colonne de type TEXT
                cursor.execute(f"PRAGMA table_info({table});")
                text_cols = [c[1] for c in cursor.fetchall() if 'TEXT' in c[2].upper() or 'CHAR' in c[2].upper()]
            
            if not text_cols:
                continue
                
            for col in text_cols:
                query = f"SELECT {col} FROM {table} WHERE {col} LIKE ? OR {col} LIKE ?;"
                try:
                    cursor.execute(query, ('%orage%', '%foudre%'))
                    results = cursor.fetchall()
                    if results:
                        # Obtenir la date de modification du fichier pour cibler fin juin
                        mtime = os.path.getmtime(db)
                        mtime_date = datetime.datetime.fromtimestamp(mtime).strftime('%Y-%m-%d %H:%M:%S')
                        
                        print(f"\n✨ Trouvé dans {basename} (Table: {table}, Col: {col}) - Modifié le: {mtime_date}")
                        print(f"   Nombre de correspondances: {len(results)}")
                        # Afficher les 2 premiers résultats
                        for r in results[:2]:
                            text = str(r[0])
                            # Tronquer à 150 caractères
                            print(f"   - {text[:150].strip()}...")
                except Exception as e:
                    pass
        conn.close()
    except Exception as e:
        print(f"Erreur d'accès à {basename}: {e}")
