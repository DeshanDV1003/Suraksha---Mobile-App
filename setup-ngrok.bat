@echo off
title Suraksha - ngrok Setup
color 0B

echo.
echo =======================================
echo   Setting up ngrok for Suraksha...
echo =======================================
echo.

echo [1/2] Configuring Account 1 (API tunnel - port 3001)...
ngrok config add-authtoken 3HtQIxBaKY5CQCIpnuuMdkKoyG7_UgomEckctoe4rqzqrJSA
echo Done.

echo.
echo [2/2] Configuring Account 2 (Socket tunnel - port 3002)...
echo NOTE: Account 2 token must be used in a separate ngrok config.
echo This is handled automatically by START.bat
echo.

echo =======================================
echo   ngrok setup complete!
echo   Now run START.bat to launch tunnels.
echo =======================================
echo.
pause
