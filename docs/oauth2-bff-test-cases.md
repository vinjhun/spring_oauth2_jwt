# OAuth2 BFF Test Cases

This document records the local OAuth2/BFF verification performed on 2026-05-15 at 15:54:11 +08:00.

## Scope

The tests cover the browser-facing authentication flow from the React login page through Spring Security form authentication, BFF OAuth2 authorization-code login, BFF session creation, token relay to resource services, and logout.

These are integration checks against the local stack, not isolated unit tests.

## Environment

| Component | URL |
| --- | --- |
| React SPA | `http://localhost:5173` |
| BFF gateway | `http://localhost:8080` |
| Authorization service | `http://localhost:9000` |
| CMS resource service | `http://localhost:8081` |
| Common service | `http://localhost:8082` |

Use `localhost` consistently. Do not mix `localhost` and `127.0.0.1` in the same test run because session cookies are host-scoped.

## Test Data

| User | Password | Purpose |
| --- | --- | --- |
| `admin@example.com` | `password` | Successful login and protected API checks. |
| `admin@example.com` | `wrong` | Invalid login check. |

## Test Cases

| ID | Scenario | Steps | Expected Result | Result |
| --- | --- | --- | --- | --- |
| AUTH-001 | Anonymous session bootstrap | Request `GET /api/session` with a fresh cookie jar. | Response has `authenticated=false`. | PASS |
| AUTH-002 | React login CSRF bootstrap | Request `GET /auth/csrf` through the frontend origin. | Response is `200` JSON with `parameterName=_csrf` and a non-empty token. | PASS |
| AUTH-003 | Invalid form login | Post `admin@example.com` / `wrong` plus the login CSRF token to `POST /auth/login`. | Response is `302` to `/login?error`. | PASS |
| AUTH-004 | Valid form login | Post `admin@example.com` / `password` plus the login CSRF token to `POST /auth/login`. | Response is `302` to `http://localhost:5173/oauth2/authorization/cms-bff`. | PASS |
| AUTH-005 | BFF authorization callback | Follow the redirect from AUTH-004 with the same cookie jar. | BFF completes authorization-code callback and `GET /api/session` returns `authenticated=true`. | PASS |
| AUTH-006 | BFF user summary | Request `GET /api/me` with the authenticated BFF session. | Response has `name=admin@example.com` and scope authorities such as `SCOPE_cms.read`. | PASS |
| AUTH-007 | CMS resource token relay | Request `GET /api/cms/articles` with the authenticated BFF session. | Response status is `200`. | PASS |
| AUTH-008 | CMS member points token relay | Request `GET /api/cms/me/points` with the authenticated BFF session. | Response status is `200`. | PASS |
| AUTH-009 | Common service token relay | Request `GET /api/common/messages?locale=en` with the authenticated BFF session. | Response status is `200`. | PASS |
| AUTH-010 | Logout | Request `GET /api/csrf`, then `POST /api/logout` with the BFF CSRF header. | Logout returns `204`; subsequent `GET /api/session` returns `authenticated=false`. | PASS |

## Commands Run

Authorization service unit tests:

```powershell
. .\scripts\dev-env.ps1
mvn -pl authorization-service test
```

Result:

```text
Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Frontend verification:

```powershell
cd frontend
.\node_modules\.bin\tsc.cmd -b
.\node_modules\.bin\vite.cmd build
```

Result:

```text
tsc -b passed
vite build passed
```

## Integration Harness Summary

The local integration harness used `curl.exe` with cookie jars and verified these checks:

```json
{
  "AnonymousSession": "PASS",
  "LoginCsrf": "PASS",
  "InvalidLogin": "PASS",
  "ValidFormLogin": "PASS",
  "BffCallbackAndSession": "PASS",
  "ApiMe": "PASS",
  "CmsArticles": "PASS",
  "CmsPoints": "PASS",
  "CommonMessages": "PASS",
  "Logout": "PASS"
}
```

## Notes From Test-Driven Pass

Two failed assertions improved the test understanding:

| Observation | Resolution |
| --- | --- |
| Mixing `127.0.0.1` and `localhost` caused the BFF session check to remain anonymous after form login. | The test now uses `http://localhost:5173` consistently because cookies are host-scoped. |
| `/api/me` did not expose `ROLE_ADMIN`; it returned OIDC and scope authorities. | The assertion now checks the actual BFF contract: user name plus authorities such as `SCOPE_cms.read`. |

The domain roles are added to JWT claims for resource-service authorization. The BFF user summary currently exposes the OAuth2/OIDC authorities it receives in its authenticated principal.
