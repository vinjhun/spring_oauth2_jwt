$ErrorActionPreference = "Stop"
. "$PSScriptRoot\dev-env.ps1"
mvn -pl authorization-service spring-boot:run

