# CMS With BFF/API Gateway Token Handling

This workspace contains a Spring Boot microservices CMS scaffold with a React SPA.

## Services

- `authorization-service` - Spring Authorization Server, JWT signing, and JWKS publication.
- `bff-gateway-service` - browser-facing OAuth2 client/BFF that owns the session and relays access tokens to resource services.
- `cms-resource-service` - stateless OAuth2 Resource Server for articles and member points.
- `common-service` - stateless OAuth2 Resource Server for messages and labels.
- `frontend` - Vite React TypeScript SPA that talks only to the BFF.

## Local Ports

- Authorization service: `http://localhost:9000`
- BFF gateway: `http://localhost:8080`
- CMS resource service: `http://localhost:8081`
- Common service: `http://localhost:8082`
- Frontend: `http://localhost:5173`

## Quick Start

Load the portable toolchain, start the stack, then open the React login page:

```powershell
. .\scripts\dev-env.ps1
.\scripts\start-local-stack.ps1 -NoTail
```

Open `http://localhost:5173/login` and sign in with one of the local users:

| User | Password | Roles |
| --- | --- | --- |
| `admin@example.com` | `password` | `ADMIN`, `MEMBER` |
| `member@example.com` | `password` | `MEMBER` |

The login form is rendered by React. Spring Security still validates the credentials and continues the OAuth2 authorization-code flow.

## Key Material

Generate a local PKCS12 keystore for the authorization service:

```bash
openssl req -newkey rsa:2048 -nodes -keyout private.key -x509 -days 3650 -out certificate.crt
openssl pkcs12 -export -inkey private.key -in certificate.crt -out authorization-service/src/main/resources/keystore.pkcs12 -name cms-jwt
```

Set the password with `JWT_KEYSTORE_PASSWORD`. Do not commit real key material.

For local development after installing the portable tools, you can generate a disposable development keystore with:

```powershell
.\scripts\generate-dev-keystore.ps1
```

## Local Tooling

Portable tools are expected under `.tools/`:

- `.tools/jdk-21`
- `.tools/apache-maven-3.9.11`
- `.tools/node-v24.15.0-win-x64`

Load them into the current PowerShell session:

```powershell
. .\scripts\dev-env.ps1
```

Then build:

```powershell
mvn clean test
cd frontend
npm install
npm run build
```

Recommended local startup is the `start-local-stack.ps1` script:

```powershell
.\scripts\start-local-stack.ps1
```

This generates the local development keystore if missing, cleanly restarts all services, writes logs to `.run/`, and streams logs to the current console. Use `-NoTail` when you want startup to finish without keeping the console attached:

```powershell
.\scripts\start-local-stack.ps1 -NoTail
```

In IntelliJ, add a PowerShell/Shell run configuration with:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-local-stack.ps1
```

IntelliJ will show the tailed logs in its Run tool window. Log files remain available locally under `.run/`.

Start the backend services in separate terminals:

```powershell
.\scripts\start-authorization-service.ps1
.\scripts\start-cms-resource-service.ps1
.\scripts\start-common-service.ps1
.\scripts\start-bff-gateway-service.ps1
```

Start the frontend:

```powershell
.\scripts\start-frontend.ps1
```

For production-like BFF Redis sessions, start Redis and run:

```powershell
.\scripts\start-bff-gateway-service-redis.ps1
```

This uses Maven profile `redis-session`, sets `SESSION_STORE_TYPE=redis`, enables Redis health checks, and reads `REDIS_HOST` / `REDIS_PORT`. Details are documented in [docs/bff-redis-session-spec.md](docs/bff-redis-session-spec.md).

Or start everything in the background:

```powershell
.\scripts\start-all.ps1
```

Stop background services:

```powershell
.\scripts\stop-all.ps1
```

## Browser Token Policy

The browser receives only the BFF session cookie. OAuth2 access and refresh tokens are stored in the server-side BFF session and are relayed to resource services by the BFF.

In local development, the frontend also proxies authentication form traffic:

| Browser URL | Dev proxy target | Purpose |
| --- | --- | --- |
| `GET /auth/csrf` | `http://localhost:9000/auth/csrf` | Load Spring Security's CSRF form token. |
| `POST /auth/login` | `http://localhost:9000/login` | Submit React login form credentials to Spring Security. |
| `GET /oauth2/authorization/cms-bff` | `http://localhost:8080/oauth2/authorization/cms-bff` | Start or continue the BFF OAuth2 login flow. |

Keep the React form action same-origin (`/auth/login`) during local development. Posting directly to `http://localhost:9000/login` from `http://localhost:5173` will trigger browser CORS/cookie problems.

## Flow Documentation

The frontend login, post-login APIs, JWT signing, JWKS publication, BFF token relay, and resource-server JWT validation flow are documented in [docs/authentication-flow.md](docs/authentication-flow.md).

The tested OAuth2/BFF scenarios and verification notes are recorded in [docs/oauth2-bff-test-cases.md](docs/oauth2-bff-test-cases.md).

A shorter localhost-tested walkthrough is available in [docs/bff-authentication-walkthrough.md](docs/bff-authentication-walkthrough.md).
