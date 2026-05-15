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

For production-like BFF Redis sessions, run the BFF with Maven profile `redis-session` and set `SESSION_STORE_TYPE=redis`, `REDIS_HEALTH_ENABLED=true`, and the Redis host/port environment variables.

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

## Flow Documentation

The frontend login, post-login APIs, JWT signing, JWKS publication, BFF token relay, and resource-server JWT validation flow are documented in [docs/authentication-flow.md](docs/authentication-flow.md).
