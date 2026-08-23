$ErrorActionPreference = 'SilentlyContinue'

$ROOT     = "D:\Suraksha - Mobile App"
$WEB_ROOT = "D:\Suraksha - Web App\backend"

# Permanent static ngrok domains — these never change
$API_DOMAIN  = "directly-tycoon-capture.ngrok-free.dev"
$SOCK_DOMAIN = "coerce-revenge-stalemate.ngrok-free.dev"

# Auth tokens for each ngrok account
$TOKEN_API  = "3HtQIxBaKY5CQCIpnuuMdkKoyG7_UgomEckctoe4rqzqrJSA"
$TOKEN_SOCK = "3HtRzxRHVSb5HFzP4qJEb4rWxsj_4Z6vMBF6fh7LmtHt8HY7B"

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
    & $pgBin status -D $pgData >$null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Already running." -ForegroundColor Green
    } else {
        & $pgBin start -D $pgData -l "$env:TEMP\postgres.log" 2>$null | Out-Null
        Start-Sleep -Seconds 2
        Write-Host "   Started." -ForegroundColor Green
    }
} else {
    Write-Host "   Skipped (pg_ctl not found)." -ForegroundColor DarkGray
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

# 4. ngrok tunnels with static domains
Write-Host "[4/5] Starting ngrok tunnels (static domains)..." -ForegroundColor Yellow

# Refresh PATH so ngrok is found even right after a fresh install
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")

# API tunnel — Account 1 (default config)
Start-Process powershell -ArgumentList "-NoExit -Command `$env:PATH = [System.Environment]::GetEnvironmentVariable('PATH','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('PATH','User'); ngrok http --domain=$API_DOMAIN 3001" -WindowStyle Minimized

# Socket tunnel — Account 2 (separate config file)
Start-Process powershell -ArgumentList "-NoExit -Command `$env:PATH = [System.Environment]::GetEnvironmentVariable('PATH','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('PATH','User'); ngrok http --config='C:\Users\ACER\AppData\Local\ngrok\ngrok2.yml' --domain=$SOCK_DOMAIN 3002" -WindowStyle Minimized

Start-Sleep -Seconds 3
Write-Host "   API    : https://$API_DOMAIN/api" -ForegroundColor Cyan
Write-Host "   Socket : https://$SOCK_DOMAIN" -ForegroundColor Cyan
Write-Host "   Both are PERMANENT — no config update needed!" -ForegroundColor Green

# 5. Config.ts already has permanent URLs — no update needed
Write-Host "[5/5] Config already set to permanent URLs." -ForegroundColor Yellow
Write-Host "   No rebuild needed after restart!" -ForegroundColor Green

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  API    : https://$API_DOMAIN/api" -ForegroundColor White
Write-Host "  Socket : https://$SOCK_DOMAIN" -ForegroundColor White
Write-Host "  Works on ANY network permanently!" -ForegroundColor Green
Write-Host "  Scan QR code with Expo Go on phone" -ForegroundColor White
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $ROOT
npx expo start
