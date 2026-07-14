@echo off
REM ==========================================
REM TÂCHE PLANIFIÉE - CAPTURE BILAN FOUDRE 24H
REM ==========================================
REM 
REM Pour automatiser cette capture chaque jour à 23:59:
REM 
REM 1. Ouvrir le Planificateur de tâches Windows (Task Scheduler)
REM 2. Créer une nouvelle tâche: "Bilan Foudre Quotidien"
REM 3. Déclencheur: Tous les jours à 23:59
REM 4. Action: Démarrer un programme
REM    - Programme: C:\Users\grego\Documents\minisite-douai\scripts\capture_foudre_task.bat
REM 5. Conditions: Démarrer même si l'ordinateur est sur batterie
REM 
REM ==========================================

cd /d "C:\Users\grego\Documents\minisite-douai"

REM Démarrer le serveur de dev si pas déjà lancé (optionnel)
REM start /B npm run dev

REM Attendre quelques secondes que le serveur soit prêt
timeout /t 5 /nobreak >nul

REM Lancer la capture (sans argument = capture d'hier pour 24h complètes)
node scripts/capture_foudre_daily.mjs

REM Log du résultat
echo [%date% %time%] Capture terminee >> logs\foudre_captures.log

exit /b 0
