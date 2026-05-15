$ErrorActionPreference = "Stop"
. "$PSScriptRoot\dev-env.ps1"
Set-Location (Join-Path (Split-Path -Parent $PSScriptRoot) "frontend")
npm install
npm run dev -- --host localhost
