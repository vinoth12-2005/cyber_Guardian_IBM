#!/usr/bin/env bash
# =================================================================
#  FlotBot AI Security Assistant — One-Click Setup & Bootstrapper
# =================================================================

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18+) from https://nodejs.org"
    exit 1
fi

node scripts/bootstrap.js --start
