@echo off
title Kantor AI Merah Putih - Uninstall

set "TARGET=%USERPROFILE%\KantorAIMerahPutih"

echo Menghapus pemasangan Kantor AI Merah Putih...
if exist "%TARGET%" rmdir /S /Q "%TARGET%"

powershell -NoProfile -Command "$p=[Environment]::GetFolderPath('Desktop')+'\Kantor AI Merah Putih.lnk'; if (Test-Path $p) { Remove-Item $p -Force }"

echo Selesai. Data tugas yang tersimpan di browser tidak ikut terhapus.
pause
