# Agent Guide

Use this guide when working in this repository. It records the current architecture, verification commands, and project-specific boundaries so future changes stay aligned with the CMS v1 design.

## Project Shape

This workspace is a Spring Boot microservices CMS with a Vite React TypeScript SPA.

- `authorization-service`: Spring Authorization Server, PKCS12 JWT signing, JWT custom claims, and public JWKS publication.
- `bff-gateway-service`: browser-facing OAuth2 client/BFF. Owns browser session state and relays access tokens to resource services.
- `cms-resource-service`: stateless OAuth2 Resource Server for articles and member points.
- `common-service`: stateless OAuth2 Resource Server for messages and labels.
- `frontend`: React SPA. Calls only the BFF.
- `docs`: project flow and agent-facing documentation.

## Non-Negotiable Auth Boundary

Do not store OAuth2 access tokens or refresh tokens in frontend code, `localStorage`, `sessionStorage`, or JavaScript-readable cookies.

The browser receives only the `CMS_BFF_SESSION` cookie. OAuth2 tokens stay server-side in the BFF session. The BFF forwards resource-service requests with `Authorization: Bearer <access_token>`.

Frontend may cache only non-sensitive lookup data such as message and label text entries.

## Login And API Flow

Start from the documented flow in [authentication-flow.md](authentication-flow.md) before changing authentication, token relay, JWKS, or resource-server security.

Important browser-facing routes:

- `GET /oauth2/authorization/cms-bff`
- `GET /api/session`
- `GET /api/me`
- `GET /api/csrf`
- `POST /api/logout`
- `GET /api/cms/**`
- `GET /api/common/**`

Resource services validate JWTs with:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${JWT_ISSUER:http://localhost:9000}
          jwk-set-uri: ${JWT_JWK_SET_URI:http://localhost:9000/.well-known/jwks.json}
```

## Local Ports

- Authorization service: `http://localhost:9000`
- BFF gateway: `http://localhost:8080`
- CMS resource service: `http://localhost:8081`
- Common service: `http://localhost:8082`
- Frontend: `http://localhost:5173`

## Local Tooling

Portable tools are expected under `.tools/`:

- `.tools/jdk-21`
- `.tools/apache-maven-3.9.11`
- `.tools/node-v24.15.0-win-x64`

Load them in PowerShell:

```powershell
. .\scripts\dev-env.ps1
```

## Build And Verification

Run backend tests from the workspace root:

```powershell
mvn test
```

Run frontend build from `frontend`:

```powershell
npm run build
```

If Vite/esbuild fails with a Windows sandbox access error while reading config, rerun the same command outside the sandbox with approval. Do not treat that sandbox error as a code failure.

## Running The App

Recommended local startup:

```powershell
.\scripts\start-local-stack.ps1
```

This generates the local development keystore if missing, cleanly restarts all services, writes logs to `.run/`, and streams logs to the current console for IntelliJ Run tool window visibility.

Use this IntelliJ PowerShell/Shell command:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-local-stack.ps1
```

Use `-NoTail` for non-interactive startup:

```powershell
.\scripts\start-local-stack.ps1 -NoTail
```

Generate a disposable local keystore manually if needed:

```powershell
.\scripts\generate-dev-keystore.ps1
```

Start all services in the background:

```powershell
.\scripts\start-all.ps1
```

Stop background services:

```powershell
.\scripts\stop-all.ps1
```

Individual service scripts are also available in `scripts/`.

Run the BFF with Redis-backed Spring Session:

```powershell
.\scripts\start-bff-gateway-service-redis.ps1
```

This requires Redis to be reachable through `REDIS_HOST` and `REDIS_PORT`. See [bff-redis-session-spec.md](bff-redis-session-spec.md).

## Credentials For Local Development

- Admin: `admin@example.com` / `password`
- Member: `member@example.com` / `password`

These are local in-memory users from the authorization service.

## Coding Notes

- Prefer Spring Security 6 style APIs such as `authorizeHttpRequests`, `requestMatchers`, and lambda config.
- Resource services must remain stateless: no login, no browser sessions, no refresh-token handling.
- Resource-service whitelists are limited to monitoring endpoints such as `/actuator/health` and `/actuator/info`.
- BFF endpoints may use CSRF protection because the browser authenticates to the BFF with a cookie.
- Keep React API calls under BFF routes and use `credentials: "include"`.
- Keep frontend feature folders modular under `frontend/src/features`.
- Keep repeated sensitive auth decisions documented in `docs/authentication-flow.md`.

## Simplification Rules

Simplify only where behavior is clear. Do not make speculative refactors.

Safe simplifications in this repo include:

- Removing unused imports or parameters.
- Extracting repeated local expressions with obvious behavior.
- Renaming misleading classes or helpers when their responsibility is unambiguous.
- Replacing fully-qualified type usage with imports when it improves readability.

Avoid simplifying:

- OAuth2, CSRF, cookie, and token-relay behavior unless tests and runtime checks prove behavior is preserved.
- Resource-server JWT validation configuration unless the authentication flow documentation is updated too.
- Frontend storage behavior in ways that could place tokens in browser-readable storage.

## Documentation Updates

When changing login, JWKS, JWT claims, BFF proxying, resource-server security, or post-login API routes, update:

- [authentication-flow.md](authentication-flow.md)
- [bff-redis-session-spec.md](bff-redis-session-spec.md) when BFF session storage changes
- `README.md` when setup or command usage changes

Then run `mvn test` and `npm run build`.
