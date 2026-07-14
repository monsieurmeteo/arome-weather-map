$baseUrl = "https://ubdevaemtwbzxksjlhjg.supabase.co/storage/v1/object/list/observations-archives"
$headers = @{
    "apikey" = "sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR"
    "Authorization" = "Bearer sb_secret_-P8iv1swkzknb9ndk5cYMw_N6bVRiCR"
    "User-Agent" = "curl/7.68.0"
    "Content-Type" = "application/json"
}

$body = @{
    prefix = "6mn/2026"
    limit = 100
    offset = 0
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $baseUrl -Method Post -Headers $headers -Body $body
Write-Output "Files in 6mn/2026/:"
$response | Format-Table name, created_at, updated_at

$body06 = @{
    prefix = "6mn/2026/06"
    limit = 100
    offset = 0
} | ConvertTo-Json
$response06 = Invoke-RestMethod -Uri $baseUrl -Method Post -Headers $headers -Body $body06
Write-Output "Files in 6mn/2026/06/:"
$response06 | Format-Table name, created_at, updated_at

$body05 = @{
    prefix = "6mn/2026/05"
    limit = 100
    offset = 0
} | ConvertTo-Json
$response05 = Invoke-RestMethod -Uri $baseUrl -Method Post -Headers $headers -Body $body05
Write-Output "Files in 6mn/2026/05/:"
$response05 | Format-Table name, created_at, updated_at

