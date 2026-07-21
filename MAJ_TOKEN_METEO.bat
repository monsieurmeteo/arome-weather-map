@echo off
chcp 65001 > nul
title Mise à jour manuelle du Token Météo-France
echo =======================================================
echo    MISE A JOUR DU TOKEN METEO-FRANCE (TOKEN 0)
echo =======================================================
echo.
python "%~dp0update_local_token.py"
echo.
echo =======================================================
echo Appuyez sur une touche pour fermer cette fenêtre...
pause > nul
