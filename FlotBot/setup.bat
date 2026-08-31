@echo off
TITLE FlotBot AI Security Assistant - Automatic Setup
cd /d "%~dp0"

echo =======================================================
echo  FlotBot AI Security Assistant - Windows One-Click Setup
echo =======================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please download and install Node.js from https://nodejs.org
    pause
    exit /b 1
)

node scripts/bootstrap.js --start
pause
