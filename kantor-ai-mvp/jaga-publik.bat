@echo off
setlocal
title Kantor AI - Penjaga Publik (otomatis nyala)
cd /d "%~dp0"

echo ================================================
echo   PENJAGA PUBLIK - KANTOR AI ID
echo   Server + tunnel otomatis nyala & restart.
echo ================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Node.js belum terpasang.
  pause
  exit /b 1
)

set "CLOUDFLARED=%~dp0..\tools\cloudflared.exe"
if not exist "%CLOUDFLARED%" (
  echo [ERROR] cloudflared.exe tidak ada di %CLOUDFLARED%
  pause
  exit /b 1
)

REM pastikan server lokal hidup
netstat -ano | findstr ":4173" | findstr "LISTENING" >nul 2>nul
if errorlevel 1 start "Kantor AI Server" /min cmd /c "node server.js"
timeout /t 4 /nobreak >nul

echo [OK] Server lokal: http://127.0.0.1:4173/
echo.
echo >>> URL publik akan muncul di bawah. Salin & kirim ke HP.
echo    Tutup jendela ini untuk berhenti total.
echo.

:loop
"%CLOUDFLARED%" tunnel --url http://127.0.0.1:4173 --no-autoupdate
echo.
echo [watchdog] Tunnel berhenti. Restart dalam 10 detik...
echo.
timeout /t 10 /nobreak >nul

REM pastikan server masih hidup
netstat -ano | findstr ":4173" | findstr "LISTENING" >nul 2>nul
if errorlevel 1 start "Kantor AI Server" /min cmd /c "node server.js"

goto :loop
