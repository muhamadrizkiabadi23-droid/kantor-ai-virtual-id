@echo off
setlocal
title Kantor AI - MODE LAN (bisa dibuka dari HP)
cd /d "%~dp0"

echo ================================================
echo   KANTOR AI ID - MODE LAN
echo   Bisa dibuka dari HP selama diperhatikan.
echo ================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Node.js belum terpasang. Install dari https://nodejs.org
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [SETUP] Menginstall dependency...
  call npm.cmd install
  echo.
)

REM --- Cari IP lokal (WiFi / Ethernet) ---
set "IP=127.0.0.1"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
  set "IP=%%a"
)
set "IP=%IP: =%"

echo [INFO] Izinkan Node.js di Windows Firewall (agar HP bisa masuk)...
netsh advfirewall firewall add rule name="Kantor AI LAN" dir=in action=allow protocol=TCP localport=4173 >nul 2>nul

echo.
echo   Laptop : http://127.0.0.1:4173/
echo   HP/WIFI: http://%IP%:4173/
echo.
echo   Syarat: HP dan laptop satu WiFi yang sama.
echo.
echo ================================================
echo.

start "" "http://127.0.0.1:4173/"

set "HOST=0.0.0.0"
node server.js

pause
