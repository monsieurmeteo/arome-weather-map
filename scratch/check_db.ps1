$url = "https://ubdevaemtwbzxksjlhjg.supabase.co/rest/v1/observations_6mn"
$headers = @{
    "apikey" = "sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR"
    "Authorization" = "Bearer sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR"
    "Prefer" = "count=exact"
}

# 1. Total records
$res1 = Invoke-RestMethod -Uri "$url?select=id" -Headers $headers -Method Head -ResponseHeadersVariable rh1
$count = $rh1["Content-Range"]

# 2. Most recent record
$recent = Invoke-RestMethod -Uri "$url?select=timestamp,id&order=timestamp.desc&limit=1" -Headers @{ "apikey" = "sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR"; "Authorization" = "Bearer sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR" }
$recentTime = $recent[0].timestamp

# 3. Oldest record
$oldest = Invoke-RestMethod -Uri "$url?select=timestamp,id&order=timestamp.asc&limit=1" -Headers @{ "apikey" = "sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR"; "Authorization" = "Bearer sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR" }
$oldestTime = $oldest[0].timestamp

# 4. Records in last hour (approx)
$lastHour = (Get-Date).AddHours(-1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$lastHourCountRes = Invoke-RestMethod -Uri "$url?select=id&timestamp=gte.$lastHour" -Headers $headers -Method Head -ResponseHeadersVariable rh2
$lastHourCount = $rh2["Content-Range"]

Write-Output "Total Count Range: $count"
Write-Output "Most Recent: $recentTime"
Write-Output "Oldest: $oldestTime"
Write-Output "Last hour records range: $lastHourCount"
