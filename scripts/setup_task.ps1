$TaskName = "MeteoDouai_ArchiveFoudre"
$ScriptPath = "C:\Users\grego\Documents\minisite-douai\scripts\run_archive.bat"

# 1. Supprimer l'ancienne tâche si elle existe (pour éviter les doublons ou conflits)
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# 2. Définir le Trigger : Tous les jours à 00h15
$Trigger = New-ScheduledTaskTrigger -Daily -At "00:15"

# 3. Action et Settings
$Action = New-ScheduledTaskAction -Execute $ScriptPath
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable -WakeToRun

# 4. Enregistrement
Register-ScheduledTask -Action $Action -Trigger $Trigger -Settings $Settings -TaskName $TaskName -Description "Archive journalière (J-1) des impacts de foudre à 00h15" -Force

Write-Host "Tâche planifiée '$TaskName' mise à jour avec succès."
Write-Host "Exécution prévue : Chaque jour à 00h15."
