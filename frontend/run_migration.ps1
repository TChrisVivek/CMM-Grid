$url = "https://avgiyfvyrttoexcukaxx.supabase.co"
$serviceKey = "YOUR_SUPABASE_SERVICE_KEY_HERE"  # Never commit real keys — set this manually before running

$headers = @{
    "apikey"        = $serviceKey
    "Authorization" = "Bearer $serviceKey"
    "Content-Type"  = "application/json"
}

# Use the Supabase SQL endpoint
$sql = "ALTER TABLE settings ADD COLUMN IF NOT EXISTS company_logo TEXT DEFAULT '';"

$body = @{ query = $sql } | ConvertTo-Json

Write-Host "Running migration: $sql"

try {
    $response = Invoke-RestMethod `
        -Method POST `
        -Uri "$url/rest/v1/rpc/exec_sql" `
        -Headers $headers `
        -Body $body `
        -ErrorAction Stop
    Write-Host "Success: $($response | ConvertTo-Json)"
} catch {
    Write-Host "RPC exec_sql not available, trying pg endpoint..."
    
    # Try direct SQL via Supabase pg endpoint  
    $pgUrl = "$url/pg/query"
    try {
        $response2 = Invoke-RestMethod `
            -Method POST `
            -Uri $pgUrl `
            -Headers $headers `
            -Body $body `
            -ErrorAction Stop
        Write-Host "Success via pg: $($response2 | ConvertTo-Json)"
    } catch {
        Write-Host "Error: $_"
        Write-Host ""
        Write-Host "=== MANUAL STEPS ==="
        Write-Host "1. Go to: https://supabase.com/dashboard/project/avgiyfvyrttoexcukaxx/sql/new"
        Write-Host "2. Paste and run this SQL:"
        Write-Host "   $sql"
        Write-Host ""
        Write-Host "Press Enter when done..."
        Read-Host
    }
}
