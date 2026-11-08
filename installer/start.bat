@echo off
title KANTOR AI ID

cd /d "%~dp0..\kantor-ai-mvp"

if not exist "node_modules\three" (
  echo Memasang dependensi pertama kali...
  call npm install --no-audit --no-fund
)

echo Menyalakan server di http://127.0.0.1:4173
start "" "http://127.0.0.1:4173/"

REM Paksa browser modern (Chrome/Edge), bukan IE
set "BROWSER="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"

node server.js

pause
