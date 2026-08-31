# FlotBot AI Security Assistant - Windows PowerShell Setup
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host " FlotBot AI Security Assistant - Windows One-Click Setup" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org" -ForegroundColor Red
    Exit 1
}

node scripts/bootstrap.js --start
