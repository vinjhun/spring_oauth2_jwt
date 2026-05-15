$ErrorActionPreference = "Stop"

$WorkspaceRoot = Split-Path -Parent $PSScriptRoot
$ToolsRoot = Join-Path $WorkspaceRoot ".tools"
$JavaHome = Join-Path $ToolsRoot "jdk-21"
$MavenHome = Join-Path $ToolsRoot "apache-maven-3.9.11"
$NodeHome = Join-Path $ToolsRoot "node-v24.15.0-win-x64"

if (!(Test-Path $JavaHome)) {
    throw "Missing JDK at $JavaHome"
}

if (!(Test-Path $MavenHome)) {
    throw "Missing Maven at $MavenHome"
}

if (!(Test-Path $NodeHome)) {
    throw "Missing Node/npm at $NodeHome"
}

$env:JAVA_HOME = $JavaHome
$env:MAVEN_HOME = $MavenHome
$env:PATH = @(
    (Join-Path $JavaHome "bin"),
    (Join-Path $MavenHome "bin"),
    $NodeHome,
    $env:PATH
) -join [IO.Path]::PathSeparator

$env:JWT_KEYSTORE_PASSWORD = if ($env:JWT_KEYSTORE_PASSWORD) { $env:JWT_KEYSTORE_PASSWORD } else { "changeit" }
$env:SESSION_COOKIE_SECURE = if ($env:SESSION_COOKIE_SECURE) { $env:SESSION_COOKIE_SECURE } else { "false" }
$env:SESSION_STORE_TYPE = if ($env:SESSION_STORE_TYPE) { $env:SESSION_STORE_TYPE } else { "none" }

if ($env:CMS_DEV_ENV_VERBOSE -eq "true") {
    Write-Host "JAVA_HOME=$env:JAVA_HOME"
    java -version
    mvn -version
    npm --version
}
