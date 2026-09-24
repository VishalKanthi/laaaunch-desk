@echo off
cd /d "%~dp0"
title Publish Launch Desk to GitHub
echo Publishing Launch Desk to GitHub...
echo.

git add .
git commit -m "Initial Launch Desk app"
git branch -M main
git remote remove origin >nul 2>nul
git remote add origin https://github.com/VishalKanthi/laaaunch-desk.git
git push -u origin main

echo.
if errorlevel 1 (
  echo Push did not complete. Read the message above; Git may be asking you to sign in.
) else (
  echo Success! Launch Desk is now published to GitHub.
)
pause
