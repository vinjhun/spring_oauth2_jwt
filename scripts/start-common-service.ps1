$ErrorActionPreference = "Stop"
. "$PSScriptRoot\dev-env.ps1"
mvn -pl common-service spring-boot:run

