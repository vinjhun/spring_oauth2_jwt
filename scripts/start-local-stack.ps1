param(
    [switch] $NoTail,
    [switch] $RedisSession
)

$ErrorActionPreference = "Stop"

$WorkspaceRoot = Split-Path -Parent $PSScriptRoot
$RunRoot = Join-Path $WorkspaceRoot ".run"
$KeystorePath = Join-Path $WorkspaceRoot "authorization-service\src\main\resources\keystore.pkcs12"

. "$PSScriptRoot\dev-env.ps1"
New-Item -ItemType Directory -Force -Path $RunRoot | Out-Null

function New-DevelopmentKeystore {
    if (Test-Path $KeystorePath) {
        Write-Host "Keystore already exists: $KeystorePath"
        return
    }

    keytool `
        -genkeypair `
        -alias cms-jwt `
        -keyalg RSA `
        -keysize 2048 `
        -storetype PKCS12 `
        -keystore $KeystorePath `
        -storepass $env:JWT_KEYSTORE_PASSWORD `
        -keypass $env:JWT_KEYSTORE_PASSWORD `
        -dname "CN=CMS Authorization Service, OU=Development, O=Local, L=Singapore, ST=Singapore, C=SG" `
        -validity 3650

    Write-Host "Created development keystore: $KeystorePath"
}

function Test-RedisConnection {
    if (-not $RedisSession) {
        return
    }

    $env:SESSION_STORE_TYPE = "redis"
    $env:REDIS_HEALTH_ENABLED = "true"
    $env:REDIS_HOST = if ($env:REDIS_HOST) { $env:REDIS_HOST } else { "localhost" }
    $env:REDIS_PORT = if ($env:REDIS_PORT) { $env:REDIS_PORT } else { "6379" }

    $RedisPortNumber = [int] $env:REDIS_PORT
    $RedisReachable = Test-NetConnection -ComputerName $env:REDIS_HOST -Port $RedisPortNumber -InformationLevel Quiet
    if (-not $RedisReachable) {
        throw "Redis is not reachable at $($env:REDIS_HOST):$($env:REDIS_PORT). Start Redis or set REDIS_HOST/REDIS_PORT before running with -RedisSession."
    }
}

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

function Wait-HttpEndpoint {
    param(
        [Parameter(Mandatory = $true)] [string] $Name,
        [Parameter(Mandatory = $true)] [string] $Uri,
        [int] $TimeoutSeconds = 90
    )

    $Deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        try {
            $Response = Invoke-WebRequest -UseBasicParsing -Uri $Uri -TimeoutSec 5
            if ($Response.StatusCode -ge 200 -and $Response.StatusCode -lt 500) {
                Write-Host "$Name is ready: $Uri"
                return
            }
        } catch {
            Start-Sleep -Seconds 2
        }
    } while ((Get-Date) -lt $Deadline)

    throw "$Name did not become ready within $TimeoutSeconds seconds: $Uri"
}

function Show-LogLocations {
    Write-Host ""
    Write-Host "Logs are in $RunRoot"
    Get-ChildItem -Path $RunRoot -Filter "*.log" -ErrorAction SilentlyContinue |
        Sort-Object Name |
        ForEach-Object { Write-Host "  $($_.FullName)" }
}

New-DevelopmentKeystore
Test-RedisConnection

& "$PSScriptRoot\stop-all.ps1"

$BffProfile = if ($RedisSession) { " -Predis-session" } else { "" }
$BffSessionEnv = if ($RedisSession) {
    "`$env:SESSION_STORE_TYPE='redis'; `$env:REDIS_HEALTH_ENABLED='true'; `$env:REDIS_HOST='$env:REDIS_HOST'; `$env:REDIS_PORT='$env:REDIS_PORT'; "
} else {
    ""
}

Start-CmsProcess -Name "authorization-service" -Command ". '$PSScriptRoot\dev-env.ps1'; mvn -pl authorization-service spring-boot:run"
Wait-HttpEndpoint -Name "authorization-service" -Uri "http://localhost:9000/actuator/health"

Start-CmsProcess -Name "cms-resource-service" -Command ". '$PSScriptRoot\dev-env.ps1'; mvn -pl cms-resource-service spring-boot:run"
Start-CmsProcess -Name "common-service" -Command ". '$PSScriptRoot\dev-env.ps1'; mvn -pl common-service spring-boot:run"
Wait-HttpEndpoint -Name "cms-resource-service" -Uri "http://localhost:8081/actuator/health"
Wait-HttpEndpoint -Name "common-service" -Uri "http://localhost:8082/actuator/health"

Start-CmsProcess -Name "bff-gateway-service" -Command ". '$PSScriptRoot\dev-env.ps1'; $BffSessionEnv mvn -pl bff-gateway-service$BffProfile spring-boot:run"
Wait-HttpEndpoint -Name "bff-gateway-service" -Uri "http://localhost:8080/api/session"

Start-CmsProcess -Name "frontend" -Command ". '$PSScriptRoot\dev-env.ps1'; Set-Location '$WorkspaceRoot\frontend'; npm install; npm run dev -- --host localhost"
Wait-HttpEndpoint -Name "frontend" -Uri "http://localhost:5173"

Show-LogLocations

if (-not $NoTail) {
    Write-Host ""
    Write-Host "Streaming logs. Press Ctrl+C to stop log streaming; services will keep running."
    $LogFiles = Get-ChildItem -Path $RunRoot -Filter "*.log" | Sort-Object Name | Select-Object -ExpandProperty FullName
    Get-Content -Path $LogFiles -Tail 40 -Wait
}
