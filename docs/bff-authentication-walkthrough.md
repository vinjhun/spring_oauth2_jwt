# BFF Authentication Walkthrough

This walkthrough explains how the React frontend, BFF gateway, authorization service, and resource services work together after login.

## Localhost Smoke Test Result

Test user:

```text
admin@example.com / password
```

Verified locally:

| Step | Result |
| --- | --- |
| Start login at BFF | `GET http://localhost:8080/oauth2/authorization/cms-bff` |
| Authorization login page | Redirected to `http://localhost:9000/login` |
| Successful login callback | Redirected to `http://localhost:5173/` |
| Session bootstrap | `GET /api/session` returned `authenticated: true` |
| Articles through BFF | `GET /api/cms/articles` returned `200` |
| Points through BFF | `GET /api/cms/me/points` returned `200` |
| Point transactions through BFF | `GET /api/cms/me/point-transactions` returned `200` |

Sample authenticated session response:

```json
{
  "authenticated": true,
  "user": {
    "name": "admin@example.com",
    "authorities": [
      "OIDC_USER",
      "SCOPE_cms.read",
      "SCOPE_cms.write",
      "SCOPE_common.read",
      "SCOPE_common.write",
      "SCOPE_openid",
      "SCOPE_profile"
    ]
  }
}
```

Sample point response:

```json
{
  "memberId": "e64c7d89-f26b-3197-aefa-854d13d7dd61",
  "balance": 0
}
```

## Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Browser + React SPA
    participant BFF as BFF Gateway :8080
    participant Auth as Authorization Service :9000
    participant CMS as CMS Resource Service :8081

    User->>Browser: Click Sign in
    Browser->>BFF: GET /oauth2/authorization/cms-bff
    BFF-->>Browser: Redirect to Authorization Service
    Browser->>Auth: GET /oauth2/authorize
    Auth-->>Browser: Redirect to /login
    Browser->>Auth: POST /login with username/password
    Auth-->>Browser: Redirect to BFF callback with authorization code
    Browser->>BFF: GET /login/oauth2/code/cms-bff?code=...
    BFF->>Auth: POST /oauth2/token with authorization code
    Auth-->>BFF: access token + refresh token
    BFF-->>Browser: Set-Cookie CMS_BFF_SESSION=...; HttpOnly; SameSite=Lax
    Browser->>BFF: GET /api/session with CMS_BFF_SESSION
    BFF-->>Browser: authenticated user summary
    Browser->>BFF: GET /api/cms/me/points with CMS_BFF_SESSION
    BFF->>BFF: Resolve session and OAuth2AuthorizedClient
    BFF->>CMS: GET /me/points with Authorization: Bearer access_token
    CMS->>Auth: GET /.well-known/jwks.json when key cache needs refresh
    Auth-->>CMS: Public JWKS
    CMS->>CMS: Validate JWT signature, issuer, expiry, and claims
    CMS-->>BFF: User-specific point balance
    BFF-->>Browser: Point balance JSON
```

## How BFF Knows The User

The React SPA does not send a JWT. It sends the browser cookie automatically:

```http
Cookie: CMS_BFF_SESSION=...
```

Spring Security uses this cookie to load the BFF server-side session. That session contains:

- the authenticated principal
- the OAuth2 authorized client for `cms-bff`
- the access token and refresh token

Then BFF proxy code receives the session-bound authorized client:

```java
@RegisteredOAuth2AuthorizedClient("cms-bff")
OAuth2AuthorizedClient authorizedClient
```

The BFF forwards the session user's access token to resource services:

```java
headers.setBearerAuth(authorizedClient.getAccessToken().getTokenValue());
```

User A and User B have different `CMS_BFF_SESSION` cookie values, so the BFF resolves different server-side sessions and relays different access tokens.

## Core JWT Concepts On Backend

### 1. Authorization Service Signs JWTs

The authorization service loads `keystore.pkcs12`, extracts the RSA private key, and builds a Nimbus `JWKSet`.

```java
RSAKey rsaKey = new RSAKey.Builder(publicKey)
        .privateKey(privateKey)
        .keyID(properties.keyId())
        .build();

return new JWKSet(rsaKey);
```

The private key signs the access token. Resource services never receive this private key.

### 2. Authorization Service Publishes Public JWKS

Resource services validate JWTs by downloading public keys:

```java
@GetMapping("/.well-known/jwks.json")
public Map<String, Object> jwks() {
    return jwkSet.toPublicJWKSet().toJSONObject();
}
```

Only public key material is exposed.

### 3. JWT Contains User Claims

The access token contains backend-useful user information:

```java
context.getClaims()
        .claim(JwtClaim.USER_ID.claimName(), UUID.nameUUIDFromBytes(username.getBytes()).toString())
        .claim(JwtClaim.EMAIL.claimName(), username)
        .claim(JwtClaim.ROLES.claimName(), roles);
```

The CMS points endpoint reads `userId` from the validated JWT:

```java
String memberId = jwt.getClaimAsString("userId");
```

### 4. Resource Services Validate JWTs

Resource services are stateless. They do not know the BFF session. They trust only valid JWTs.

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${JWT_ISSUER:http://localhost:9000}
          jwk-set-uri: ${JWT_JWK_SET_URI:http://localhost:9000/.well-known/jwks.json}
```

Validation includes:

- token signature matches the authorization service public key
- token issuer matches `http://localhost:9000`
- token is not expired
- token claims are available to Spring Security

### 5. Browser Token Policy

The browser never sees the JWT access token or refresh token.

Correct browser storage:

```text
CMS_BFF_SESSION cookie only
```

Incorrect browser storage:

```text
localStorage.accessToken
sessionStorage.refreshToken
JavaScript-readable JWT cookie
```

This is the main reason the BFF pattern is safer for the React SPA.
