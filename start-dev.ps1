$ErrorActionPreference = 'SilentlyContinue'

$ROOT     = "D:\Suraksha - Mobile App"
$WEB_ROOT = "D:\Suraksha - Web App\backend"
$CONFIG   = "$ROOT\src\config.ts"

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Suraksha Dev Launcher" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# 1. PostgreSQL
Write-Host "[1/5] Starting PostgreSQL..." -ForegroundColor Yellow
$pgBin  = "D:\PostgreSQL\pgsql\bin\pg_ctl.exe"
$pgData = "D:\OdooData\pgdata"
if (Test-Path $pgBin) {
    & $pgBin start -D $pgData -l "$env:TEMP\postgres.log" 2>$null | Out-Null
    Start-Sleep -Seconds 2
    Write-Host "   Done." -ForegroundColor Green
} else {
    Write-Host "   Skipped." -ForegroundColor DarkGray
}

# 2. Web Backend
Write-Host "[2/5] Starting Web Backend (port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command cd '$WEB_ROOT'; npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 4
Write-Host "   Done." -ForegroundColor Green

# 3. Mobile Backend
Write-Host "[3/5] Starting Mobile Backend (port 3002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command cd '$ROOT\backend'; npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 4
Write-Host "   Done." -ForegroundColor Green

# 4. Quick tunnels via jobs (captures stderr correctly)
Write-Host "[4/5] Starting Cloudflare tunnels (waiting up to 60s)..." -ForegroundColor Yellow

$jobApi  = Start-Job -ScriptBlock { & cloudflared tunnel --url http://localhost:3001 2>&1 }
$jobSock = Start-Job -ScriptBlock { & cloudflared tunnel --url http://localhost:3002 2>&1 }

$API_URL  = ""
$SOCK_URL = ""
$elapsed  = 0

while (($API_URL -eq "" -or $SOCK_URL -eq "") -and $elapsed -lt 60) {
    Start-Sleep -Seconds 3
    $elapsed += 3

    if ($API_URL -eq "") {
        $output = Receive-Job $jobApi -Keep 2>&1 | Out-String
        if ($output -match "https://([a-z0-9\-]+\.trycloudflare\.com)") {
            $API_URL = "https://$($matches[1])"
        }
    }

    if ($SOCK_URL -eq "") {
        $output = Receive-Job $jobSock -Keep 2>&1 | Out-String
        if ($output -match "https://([a-z0-9\-]+\.trycloudflare\.com)") {
            $SOCK_URL = "https://$($matches[1])"
        }
    }

    Write-Host "   [$elapsed s] API: $(if($API_URL){'OK - ' + $API_URL}else{'waiting'})  Socket: $(if($SOCK_URL){'OK'}else{'waiting'})" -ForegroundColor DarkGray
}

if ($API_URL -eq "")  { $API_URL  = "http://192.168.8.121:3001"; Write-Host "   API tunnel failed - using local IP" -ForegroundColor Red }
else { Write-Host "   API    : $API_URL" -ForegroundColor Cyan }

if ($SOCK_URL -eq "") { $SOCK_URL = "http://192.168.8.121:3002"; Write-Host "   Socket tunnel failed - using local IP" -ForegroundColor Red }
else { Write-Host "   Socket : $SOCK_URL" -ForegroundColor Cyan }

$API_FULL = "$API_URL/api"

# 5. Update config.ts
Write-Host "[5/5] Updating config.ts..." -ForegroundColor Yellow
$line1 = "// Auto-updated by start-dev.ps1 - do not edit manually"
$line2 = "export const API_BASE_URL = '$API_FULL';"
$line3 = "export const SOCKET_URL   = '$SOCK_URL';"
Set-Content -Path $CONFIG -Value "$line1`n$line2`n$line3" -Encoding utf8
Write-Host "   Done." -ForegroundColor Green

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  API    : $API_FULL" -ForegroundColor White
Write-Host "  Socket : $SOCK_URL" -ForegroundColor White
Write-Host "  Works on ANY network - no IP changes" -ForegroundColor Green
Write-Host "  Scan QR code with Expo Go on phone" -ForegroundColor White
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $ROOT
npx expo start
