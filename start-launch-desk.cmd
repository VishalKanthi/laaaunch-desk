@echo off
cd /d "%~dp0"
title Launch Desk server
echo Starting Launch Desk at http://localhost:8808
echo Do not close this window while using the app.
echo Updating the local server...
npm run build > launch-desk-startup.log 2>&1 && npm run bundle:server >> launch-desk-startup.log 2>&1
if errorlevel 1 (
  echo.
  echo The server build failed. Open launch-desk-startup.log to see the exact error.
  pause >nul
  exit /b 1
)
set "LAUNCH_NODE=%LOCALAPPDATA%\OpenAI\Codex\runtimes\node\node.exe"
if exist "%LAUNCH_NODE%" (
  "%LAUNCH_NODE%" build\server\index.js >> launch-desk-startup.log 2>&1
) else (
  node build\server\index.js >> launch-desk-startup.log 2>&1
)
echo.
echo Launch Desk stopped. Review any error above, then press a key to close.
pause >nul
