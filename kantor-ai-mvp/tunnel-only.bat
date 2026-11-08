@echo off
title KANTOR AI ID - Tunnel Publik
cd /d "%~dp0.."
echo ================================================
echo   KANTOR AI ID - TUNNEL PUBLIK
echo   URL https://*.trycloudflare.com muncul di bawah.
echo ================================================
"%~dp0..\tools\cloudflared.exe" tunnel --url http://127.0.0.1:4173 --no-autoupdate
pause
