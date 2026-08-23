@echo off
title Lancement Météo AROME HD
cd /d "%~dp0"
echo ===================================================
echo     Demarrage du serveur Meteo AROME HD...
echo ===================================================
start "" "http://localhost:8080"
python -m http.server 8080
pause
