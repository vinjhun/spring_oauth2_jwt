$ErrorActionPreference = "Stop"
. "$PSScriptRoot\dev-env.ps1"
mvn -pl bff-gateway-service spring-boot:run

