@echo off
title Kantor AI - Penjaga Server
cd /d "%~dp0"

echo ================================================
echo   PENJAGA SERVER - Kantor AI Merah Putih
echo   Server otomatis restart bila berhenti.
echo ================================================
echo.

:loop
node server.js
echo.
echo [watchdog] Server berhenti. Restart dalam 3 detik...
echo            Tekan Ctrl+C dua kali untuk berhenti total.
echo.
timeout /t 3 /nobreak >nul
goto loop
