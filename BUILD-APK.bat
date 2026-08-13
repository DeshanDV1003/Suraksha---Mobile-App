@echo off
echo.
echo =======================================
echo   Suraksha APK Builder
echo =======================================
echo.
echo Step 1: Make sure START.bat has been run first
echo         so the tunnel URLs are in config.ts
echo.
echo Current config.ts URLs:
type "D:\Suraksha - Mobile App\src\config.ts"
echo.
echo Step 2: Building APK via EAS (takes ~10 min)...
echo         The APK will be available to download
echo         from expo.dev when complete.
echo.
cd "D:\Suraksha - Mobile App"
powershell -ExecutionPolicy Bypass -Command "eas build -p android --profile preview"
pause
