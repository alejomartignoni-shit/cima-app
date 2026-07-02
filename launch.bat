@echo off
title CIMA
cd /d "%~dp0"

echo  Iniciando CIMA...

:: Start dev server in background window (hidden)
start /min cmd /c "npm run dev"

:: Wait for Vite to be ready (3 seconds is usually enough)
timeout /t 3 /nobreak > nul

:: Open in Chrome app mode (standalone window, no browser chrome)
start "" chrome --app=http://localhost:5173 --window-size=430,900 --window-position=100,50

exit
