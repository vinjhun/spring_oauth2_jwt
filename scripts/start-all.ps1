$ErrorActionPreference = "Stop"

$WorkspaceRoot = Split-Path -Parent $PSScriptRoot
$RunRoot = Join-Path $WorkspaceRoot ".run"
New-Item -ItemType Directory -Force -Path $RunRoot | Out-Null

function Start-CmsProcess {
    param(
        [Parameter(Mandatory = $true)] [string] $Name,
        [Parameter(Mandatory = $true)] [string] $Command
    )

    $OutFile = Join-Path $RunRoot "$Name.out.log"
    $ErrFile = Join-Path $RunRoot "$Name.err.log"

    $Process = Start-Process `
        -FilePath "powershell" `
        -ArgumentList "-ExecutionPolicy", "Bypass", "-Command", $Command `
        -WorkingDirectory $WorkspaceRoot `
        -WindowStyle Hidden `
        -RedirectStandardOutput $OutFile `
        -RedirectStandardError $ErrFile `
        -PassThru

    Set-Content -Path (Join-Path $RunRoot "$Name.pid") -Value $Process.Id
    Write-Host "$Name started with PID $($Process.Id)"
}

Start-CmsProcess -Name "authorization-service" -Command ". '$PSScriptRoot\dev-env.ps1'; mvn -pl authorization-service spring-boot:run"
Start-Sleep -Seconds 8
Start-CmsProcess -Name "cms-resource-service" -Command ". '$PSScriptRoot\dev-env.ps1'; mvn -pl cms-resource-service spring-boot:run"
Start-CmsProcess -Name "common-service" -Command ". '$PSScriptRoot\dev-env.ps1'; mvn -pl common-service spring-boot:run"
Start-Sleep -Seconds 8
Start-CmsProcess -Name "bff-gateway-service" -Command ". '$PSScriptRoot\dev-env.ps1'; mvn -pl bff-gateway-service spring-boot:run"
Start-CmsProcess -Name "frontend" -Command ". '$PSScriptRoot\dev-env.ps1'; Set-Location '$WorkspaceRoot\frontend'; npm run dev -- --host localhost"

Write-Host "Logs are in $RunRoot"
