$ErrorActionPreference = "Continue"

$WorkspaceRoot = Split-Path -Parent $PSScriptRoot
$RunRoot = Join-Path $WorkspaceRoot ".run"

Get-ChildItem -Path $RunRoot -Filter "*.pid" -ErrorAction SilentlyContinue | ForEach-Object {
    $ProcessId = Get-Content $_.FullName
    if ($ProcessId) {
        Stop-Process -Id ([int] $ProcessId) -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped $($_.BaseName) PID $ProcessId"
    }
}

$AppPatterns = @(
    "com.example.cms.authorization.AuthorizationServiceApplication",
    "com.example.cms.bff.BffGatewayServiceApplication",
    "com.example.cms.resource.CmsResourceServiceApplication",
    "com.example.cms.common.CommonServiceApplication",
    "vite --host 127.0.0.1",
    "spring-boot:run"
)

try {
    Get-CimInstance Win32_Process | Where-Object {
        $commandLine = $_.CommandLine
        $commandLine -and ($AppPatterns | Where-Object { $commandLine.Contains($_) })
    } | ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped process $($_.ProcessId): $($_.Name)"
    }
} catch {
    Write-Warning "Could not inspect child process command lines. Run this script from a normal PowerShell session if any Java/Vite process remains."
}
