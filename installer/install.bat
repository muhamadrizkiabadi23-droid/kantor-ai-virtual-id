@echo off
setlocal EnableDelayedExpansion
title KANTOR AI ID - Installer
cd /d "%~dp0"

echo ============================================
echo   KANTOR AI ID - INSTALLER
echo   Sekali klik, semua terpasang.
echo ============================================
echo.

set "TARGET=%USERPROFILE%\KantorAIID"
set "SRC=%~dp0..\kantor-ai-mvp"

if not exist "%SRC%" (
  echo [ERROR] Folder sumber tidak ditemukan: %SRC%
  pause
  exit /b 1
)

if exist "%TARGET%" (
  echo Folder tujuan sudah ada: %TARGET%
  echo Memperbarui dengan versi terbaru...
  rmdir /S /Q "%TARGET%"
)

echo [1/5] Menyiapkan folder...
mkdir "%TARGET%" 2>nul
echo       %TARGET%

echo [2/5] Menyalin berkas aplikasi (tanpa node_modules)...
robocopy "%SRC%" "%TARGET%\kantor-ai-mvp" /E /XD node_modules .git vid /XF *.log *.tmp /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 (
  echo GAGAL menyalin berkas. Jalankan sebagai Administrator.
  pause
  exit /b 1
)

REM Salin tools (cloudflared untuk mode publik) bila ada
if exist "%~dp0..\tools" (
  robocopy "%~dp0..\tools" "%TARGET%\tools" /E /XF *.log /NFL /NDL /NJH /NJS /NP >nul
)

echo [3/5] Memeriksa Node.js...
where node >nul 2>nul
if errorlevel 1 (
  echo       Node.js belum terpasang. Mengunduh Node.js LTS...
  call :InstallNode
) else (
  for /f "tokens=* delims=" %%v in ('node -v') do echo       %%v OK
)

echo [4/5] Memasang dependensi (three.js)...
pushd "%TARGET%\kantor-ai-mvp"
call npm.cmd install --no-audit --no-fund
if errorlevel 1 (
  echo GAGAL memasang dependensi.
  popd
  pause
  exit /b 1
)
popd

echo [5/5] Membuat pintasan desktop...
call :MakeShortcut

echo.
echo ============================================
echo   SELESAI. Kantor AI siap dipakai.
echo.
echo   Buka: %TARGET%\kantor-ai-mvp\start.bat
echo   atau klik pintasan di desktop.
echo.
echo   Mode HP / konsumen: start-publik.bat
echo ============================================
pause
goto :eof

:InstallNode
where winget >nul 2>nul
if not errorlevel 1 (
  winget install --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
  goto :eof
)
echo       winget tidak tersedia, mengunduh Node.js MSI...
powershell -NoProfile -Command "$u='https://nodejs.org/dist/latest-lts/node-v22.14.0-x64.msi'; $o='$env:TEMP\node-lts.msi'; Invoke-WebRequest -Uri $u -OutFile $o; Start-Process msiexec.exe -ArgumentList '/i',$o,'/quiet','/norestart' -Wait"
goto :eof

:MakeShortcut
powershell -NoProfile -Command "$ws=New-Object -ComObject WScript.Shell; $s=$ws.CreateShortcut([Environment]::GetFolderPath('Desktop')+'\\KANTOR AI ID.lnk'); $s.TargetPath='%TARGET%\kantor-ai-mvp\start.bat'; $s.WorkingDirectory='%TARGET%\kantor-ai-mvp'; $s.IconLocation='%SystemROOT%\System32\shell32.dll,234'; $s.Save()"
goto :eof
