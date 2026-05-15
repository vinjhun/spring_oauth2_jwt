$ErrorActionPreference = "Stop"

$env:CMS_DEV_ENV_VERBOSE = if ($env:CMS_DEV_ENV_VERBOSE) { $env:CMS_DEV_ENV_VERBOSE } else { "true" }
. "$PSScriptRoot\dev-env.ps1"

$KeystorePath = Join-Path (Split-Path -Parent $PSScriptRoot) "authorization-service\src\main\resources\keystore.pkcs12"

if (Test-Path $KeystorePath) {
    Write-Host "Keystore already exists: $KeystorePath"
    exit 0
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
