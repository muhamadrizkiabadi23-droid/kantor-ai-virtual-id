@echo off
setlocal
title Kantor AI - MODE PUBLIK (HP dari jaringan mana pun)
cd /d "%~dp0"

echo ================================================
echo   KANTOR AI ID - MODE PUBLIK
echo   URL bisa dibuka di HP lewat data/WiFi apa pun.
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

set "CLOUDFLARED=%~dp0..\tools\cloudflared.exe"
if not exist "%CLOUDFLARED%" (
  echo [ERROR] cloudflared.exe tidak ada di:
  echo         %CLOUDFLARED%
  pause
  exit /b 1
)

REM --- Port 4173 harus bebas agar terowongan cocok ---
netstat -ano | findstr ":4173" | findstr "LISTENING" >nul 2>nul
if not errorlevel 1 (
  echo [PERINGATAN] Port 4173 sudah dipakai.
  echo              Tutup aplikasi lain yang memakainya dulu.
  echo.
)

echo [1/2] Menjalankan server lokal...
start "Kantor AI Server" /min cmd /c "node server.js"

echo       Menunggu server siap...
timeout /t 4 /nobreak >nul

echo [2/2] Membuka terowongan publik Cloudflare...
echo.
echo   >>> Salin URL https://....trycloudflare.com yang muncul di bawah
echo   >>> lalu kirim ke HP konsumen (buka di browser HP).
echo.
echo ================================================
echo.

"%CLOUDFLARED%" tunnel --url http://127.0.0.1:4173 --no-autoupdate

echo.
echo [SELESAI] Terowongan ditutup.
pause
