# Activation du Radar Automatique (Gratuit via GitHub)

Tout est prêt côté code. Il ne manque que les "clés" secrètes pour que GitHub ait le droit d'écrire dans votre base de données Supabase.

## 1. Allez sur GitHub
Ouvrez votre dépôt GitHub dans votre navigateur.
Allez dans l'onglet **Settings** (Paramètres) du dépôt.

## 2. Ajoutez les Secrets
Dans le menu de gauche, cliquez sur **Secrets and variables** > **Actions**.
Cliquez sur le bouton vert **New repository secret**.

Ajoutez ces 3 secrets (copiez-collez les noms et valeurs exacts) :

### Secret 1 : URL Supabase
**Name:** `SUPABASE_URL`
**Secret:** `https://ubdevaemtwbzxksjlhjg.supabase.co`

### Secret 2 : Clé API Météo-France (Je l'ai extraite pour vous)
**Name:** `MF_RADAR_API_KEY`
**Secret:** `eyJ4NXQiOiJZV0kxTTJZNE1qWTNOemsyTkRZeU5XTTRPV014TXpjek1UVmhNbU14T1RSa09ETXlOVEE0Tnc9PSIsImtpZCI6ImdhdGV3YXlfY2VydGlmaWNhdGVfYWxpYXMiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJHcmVnNTk4ODBAY2FyYm9uLnN1cGVyIiwiYXBwbGljYXRpb24iOnsib3duZXIiOiJHcmVnNTk4ODAiLCJ0aWVyUXVvdGFUeXBlIjpudWxsLCJ0aWVyIjoiVW5saW1pdGVkIiwibmFtZSI6IkRlZmF1bHRBcHBsaWNhdGlvbiIsImlkIjoyMzg0MCwidXVpZCI6IjA3YTRhZjk0LWE4MzktNDllZC05MjJlLTAyZDMyMTM1ZjVlZSJ9LCJpc3MiOiJodHRwczpcL1wvcG9ydGFpbC1hcGkubWV0ZW9mcmFuY2UuZnI6NDQzXC9vYXV0aDJcL3Rva2VuIiwidGllckluZm8iOnsiNTBQZXJNaW4iOnsidGllclF1b3RhVHlwZSI6InJlcXVlc3RDb3VudCIsImdyYXBoUUxNYXhDb21wbGV4aXR5IjowLCJncmFwaFFMTWF4RGVwdGgiOjAsInN0b3BPblF1b3RhUmVhY2giOnRydWUsInNwaWtlQXJyZXN0TGltaXQiOjAsInNwaWtlQXJyZXN0VW5pdCI6InNlYyJ9LCI2MFJlcVBhck1pbiI6eyJ0aWVyUXVvdGFUeXBlIjoicmVxdWVzdENvdW50IiwiZ3JhcGhRTE1heENvbXBsZXhpdHkiOjAsImdyYXBoUUxNYXhEZXB0aCI6MCwic3RvcE9uUXVvdGFSZWFjaCI6dHJ1ZSwic3Bpa2VBcnJlc3RMaW1pdCI6MCwic3Bpa2VBcnJlc3RVbml0Ijoic2VjIn19LCJrZXl0eXBlIjoiUFJPRFVDVElPTiIsInN1YnNjcmliZWRBUElzIjpbeyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IkRvbm5lZXNQdWJsaXF1ZXNWaWdpbGFuY2UiLCJjb250ZXh0IjoiXC9wdWJsaWNcL0RQVmlnaWxhbmNlXC92MSIsInB1Ymxpc2hlciI6ImFkbWluIiwidmVyc2lvbiI6InYxIiwic3Vic2NyaXB0aW9uVGllciI6IjYwUmVxUGFyTWluIn0seyJzdWJzY3JpcHRpb25UaWVyIjoiNTBQZXJNaW4ifSx7InN1YnNjcmliZXJUZW5hbnREb21haW4iOiJjYXJib24uc3VwZXIiLCJuYW1lIjoiRG9ubmVlc1B1YmxpcXVlc1BhcXVldE9ic2VydmF0aW9uIiwiY29udGV4dCI6IlwvcHVibGljXC9EUFBhcXVldE9ic1wvdjEiLCJwdWJsaXNoZXIiOiJiYXN0aWVuZyIsInZlcnNpb24iOiJ2MSIsInN1YnNjcmlwdGlvblRpZXIiOiI1MFBlck1pbiJ9LHsic3Vic2NyaWJlclRlbmFudERvbWFpbiI6ImNhcmJvbi5zdXBlciIsIm5hbWUiOiJEb25uZWVzUHVibGlxdWVzUGFxdWV0UmFkYXIiLCJjb250ZXh0IjoiXC9wdWJsaWNcL0RQUGFxdWV0UmFkYXJcL3YxIiwicHVibGlzaGVyIjoibG9pYy5tYXJ0aW4iLCJ2ZXJzaW9uIjoidjEiLCJzdWJzY3JpcHRpb25UaWVyIjoiNTBQZXJNaW4ifV0sImV4cCI6MTc5NzEwODA4NSwidG9rZW5fdHlwZSI6ImFwaUtleSIsImlhdCI6MTc3MTE4ODA4NSwianRpIjoiODI0MGIzZGMtY2UzZC00NmNmLTkzZmUtZTA2NjcyNzI3MzhkIn0=.kSqIJ29wODMzqPsin_feSHH1SxixjPwTKXidkxPoyBWDZucTSjkam1NxTAtfoNuDZYuvkONX1cBhSBfb-FOrK-XHV7pd0TCesGD-YaX5r-Sd9XspDEEq-y9_Yz3bLzIY7lOWRYTP8KoGnEiu5D4_Z9w2FiZ4EXbyIh2wPlWJwc4ZP4icPvek39MbQeLcSgdDQdtHaPn8dcyUpBxyl-bcAhjY2ho8qdE1TKfbm6umI2MNgyAg6o-GejoE967cVfqmt8Jsqxz6maCsclVEL380HeH0v60TtVNgV1UIbG_VFz_phaBSpzM3RCkOnL1VLFHJw57MB7QQlN7_E63oJl9ARA==`

### Secret 3 : Clé Service Role Supabase (À trouver)
Celle-ci, je ne peux pas la voir. Vous devez la récupérer :
1. Allez sur https://supabase.com/dashboard
2. Ouvrez votre projet `ubdevaemtwbzxksjlhjg`
3. Allez dans **Project Settings** (roue dentée) > **API**
4. Cherchez la section "service_role key" (C'est la clé secrète qui a tous les droits, ne la partagez pas).
5. Copiez-la.

**Name:** `SUPABASE_SERVICE_ROLE_KEY`
**Secret:** (Collez la clé commençant par `ey...`)

## 3. C'est tout !
Une fois ces 3 secrets enregistrés, GitHub lancera automatiquement le script toutes les 5 minutes.
Vous verrez les images apparaître dans votre application météo sans rien faire.
