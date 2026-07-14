@echo off
cd /d "C:\Users\grego\Documents\minisite-douai"
echo [%DATE% %TIME%] Lancement archivage... >> logs\archive.log
node scripts\archive_lightning.js >> logs\archive.log 2>&1
echo [%DATE% %TIME%] Fin archivage. >> logs\archive.log
echo ----------------------------------- >> logs\archive.log
