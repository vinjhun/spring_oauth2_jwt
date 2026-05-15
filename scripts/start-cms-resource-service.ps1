$ErrorActionPreference = "Stop"
. "$PSScriptRoot\dev-env.ps1"
mvn -pl cms-resource-service spring-boot:run

