# Spec: BFF Redis-Backed Spring Session

## Objective

Enable `bff-gateway-service` to run in two supported modes:

- Local/simple mode: servlet session storage in the BFF process, no Redis dependency required.
- Redis session mode: Spring Session stores BFF HTTP sessions and OAuth2 authorized-client state in Redis so multiple BFF instances can resolve the same `CMS_BFF_SESSION` cookie.

The browser token policy does not change. The browser receives only the `CMS_BFF_SESSION` cookie. Access tokens and refresh tokens remain server-side.

## Current Implementation

The BFF already has:

- `redis-session` Maven profile in `bff-gateway-service/pom.xml`.
- `spring-session-data-redis` and `spring-boot-starter-data-redis` dependencies under that profile.
- `spring.session.store-type: ${SESSION_STORE_TYPE:none}` in `bff-gateway-service/src/main/resources/application.yml`.
- Redis host/port configuration through `REDIS_HOST` and `REDIS_PORT`.
- Redis health indicator controlled by `REDIS_HEALTH_ENABLED`.

## Commands

Run BFF without Redis:

```powershell
.\scripts\start-bff-gateway-service.ps1
```

Run BFF with Redis-backed Spring Session:

```powershell
.\scripts\start-bff-gateway-service-redis.ps1
```

Build and test BFF with Redis session dependencies active:

```powershell
mvn -pl bff-gateway-service -Predis-session test
```

## Configuration

Redis mode requires a reachable Redis server.

Environment variables:

```text
SESSION_STORE_TYPE=redis
REDIS_HEALTH_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
```

The Redis namespace is configured as:

```yaml
spring:
  session:
    redis:
      namespace: cms:bff:sessions
```

## Project Structure

- `bff-gateway-service/pom.xml`: keeps Redis dependencies isolated behind `redis-session`.
- `bff-gateway-service/src/main/resources/application.yml`: contains session and Redis properties.
- `scripts/start-bff-gateway-service.ps1`: starts local/simple BFF mode.
- `scripts/start-bff-gateway-service-redis.ps1`: starts Redis session mode.
- `docs/bff-redis-session-spec.md`: records this behavior.

## Code Style

Use environment-driven configuration rather than hardcoding deployment values:

```yaml
spring:
  session:
    store-type: ${SESSION_STORE_TYPE:none}
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
```

## Testing Strategy

- Compile/test the BFF with `-Predis-session` to prove Redis dependencies resolve and the app still compiles.
- For runtime verification, start Redis, start the BFF with `start-bff-gateway-service-redis.ps1`, log in, and confirm sessions continue to resolve through the BFF.
- Multi-instance verification should run two BFF instances with the same Redis namespace and confirm the same browser session works against either instance.

## Boundaries

- Always: keep frontend token storage disabled.
- Always: use Redis-backed sessions for multiple BFF instances.
- Always: keep resource services stateless JWT Resource Servers.
- Ask first: adding Docker Compose, changing Redis topology, or introducing external Redis credentials.
- Never: move OAuth2 access or refresh tokens into browser-readable storage.

## Success Criteria

- Local BFF mode still runs without Redis.
- Redis BFF mode starts with `SESSION_STORE_TYPE=redis` and Maven profile `redis-session`.
- BFF fails early with a clear message when Redis mode is requested but Redis is unreachable.
- `mvn -pl bff-gateway-service -Predis-session test` passes.
- Documentation tells operators which mode to use and why.

## Open Questions

- Should this repository include a Docker Compose Redis service, or will Redis be managed externally?
- Should multi-instance local testing use different BFF ports in scripts?
