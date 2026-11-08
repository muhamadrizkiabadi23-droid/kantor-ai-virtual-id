@echo off
title Kantor AI Merah Putih - MVP
cd /d "%~dp0"

echo ================================================
echo   KANTOR AI MERAH PUTIH - MVP Preview
echo ================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Node.js belum terinstall.
  echo Silakan install Node.js 20+ dari https://nodejs.org
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [SETUP] Menginstall dependency (three.js)...
  call npm.cmd install
  echo.
)

echo [START] Menjalankan server...
echo.
echo   URL: http://127.0.0.1:4173/
echo   Tekan Ctrl+C untuk berhenti
echo.
echo ================================================
echo.

REM Browser default Windows sering Internet Explorer - tidak support WebGL 3D.
REM Pakai Chrome/Edge secara eksplisit.
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
set "CHROME_X86=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
set "EDGE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
set "EDGE64=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

if exist "%CHROME%" (
  start "" "%CHROME%" "http://127.0.0.1:4173/"
) else if exist "%CHROME_X86%" (
  start "" "%CHROME_X86%" "http://127.0.0.1:4173/"
) else if exist "%EDGE%" (
  start "" "%EDGE%" "http://127.0.0.1:4173/"
) else if exist "%EDGE64%" (
  start "" "%EDGE64%" "http://127.0.0.1:4173/"
) else (
  echo [INFO] Chrome/Edge tidak ditemukan. Buka manual: http://127.0.0.1:4173/
)

node server.js

pause
