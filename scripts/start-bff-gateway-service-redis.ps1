$ErrorActionPreference = "Stop"
. "$PSScriptRoot\dev-env.ps1"

$env:SESSION_STORE_TYPE = "redis"
$env:REDIS_HEALTH_ENABLED = "true"
$env:REDIS_HOST = if ($env:REDIS_HOST) { $env:REDIS_HOST } else { "localhost" }
$env:REDIS_PORT = if ($env:REDIS_PORT) { $env:REDIS_PORT } else { "6379" }

$RedisPortNumber = [int] $env:REDIS_PORT
$RedisConnection = Test-NetConnection -ComputerName $env:REDIS_HOST -Port $RedisPortNumber -InformationLevel Quiet
if (-not $RedisConnection) {
    throw "Redis is not reachable at $($env:REDIS_HOST):$($env:REDIS_PORT). Start Redis or set REDIS_HOST/REDIS_PORT before running this script."
}

mvn -pl bff-gateway-service -Predis-session spring-boot:run
