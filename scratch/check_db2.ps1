$baseUrl = "https://ubdevaemtwbzxksjlhjg.supabase.co/rest/v1/observations_6mn"
$headers = @{
    "apikey" = "sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR"
    "Authorization" = "Bearer sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR"
    "User-Agent" = "curl/7.68.0"
}

$recentUrl = "$baseUrl`?select=timestamp,id&order=timestamp.desc&limit=1"
$recent = Invoke-RestMethod -Uri $recentUrl -Headers $headers
$recentTime = $recent[0].timestamp

$oldestUrl = "$baseUrl`?select=timestamp,id&order=timestamp.asc&limit=1"
$oldest = Invoke-RestMethod -Uri $oldestUrl -Headers $headers
$oldestTime = $oldest[0].timestamp

$lastHour = (Get-Date).AddHours(-1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$lastHourUrl = "$baseUrl`?select=id&timestamp=gte.$lastHour"
$lastHourRecords = Invoke-RestMethod -Uri $lastHourUrl -Headers $headers
$lastHourCount = if ($null -ne $lastHourRecords) { $lastHourRecords.Count } else { 0 }

Write-Output "=== STATUT SUPABASE ==="
Write-Output "Donnee la plus recente : $recentTime"
Write-Output "Donnee la plus ancienne: $oldestTime"
Write-Output "Nombre de records dans la derniere heure : $lastHourCount"
