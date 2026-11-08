@echo off
title KANTOR AI ID - Uninstall

set "TARGET=%USERPROFILE%\KantorAIID"

echo Menghapus pemasangan KANTOR AI ID...
if exist "%TARGET%" rmdir /S /Q "%TARGET%"

powershell -NoProfile -Command "$p=[Environment]::GetFolderPath('Desktop')+'\KANTOR AI ID.lnk'; if (Test-Path $p) { Remove-Item $p -Force }"

echo Selesai. Data tugas yang tersimpan di browser tidak ikut terhapus.
pause
