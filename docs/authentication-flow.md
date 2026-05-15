# Authentication Flow

This document records the CMS v1 browser login flow, the APIs used after login, and the core backend mechanisms that keep OAuth2 tokens out of browser storage.

## Login And API Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant SPA as React SPA (localhost:5173)
    participant BFF as BFF Gateway (localhost:8080)
    participant Auth as Authorization Service (localhost:9000)
    participant CMS as CMS Resource Service (localhost:8081)
    participant Common as Common Service (localhost:8082)

    User->>SPA: Click Sign in
    SPA->>BFF: GET /oauth2/authorization/cms-bff
    BFF->>Auth: Redirect to /oauth2/authorize
    Auth->>User: GET /login
    User->>Auth: POST /login
    Auth->>BFF: Redirect /login/oauth2/code/cms-bff?code=...
    BFF->>Auth: POST /oauth2/token
    Auth-->>BFF: access_token + refresh_token
    BFF-->>SPA: Set-Cookie CMS_BFF_SESSION; HttpOnly; SameSite=Lax
    SPA->>BFF: GET /api/session
    BFF-->>SPA: authenticated user summary
    SPA->>BFF: GET /api/me
    BFF-->>SPA: user name + roles
    SPA->>BFF: GET /api/cms/articles
    BFF->>CMS: GET /articles with Authorization: Bearer access_token
    CMS-->>BFF: articles page
    BFF-->>SPA: articles page
    SPA->>BFF: GET /api/cms/me/points
    BFF->>CMS: GET /me/points with Authorization: Bearer access_token
    CMS-->>BFF: point balance
    BFF-->>SPA: point balance
    SPA->>BFF: GET /api/cms/me/point-transactions
    BFF->>CMS: GET /me/point-transactions with Authorization: Bearer access_token
    CMS-->>BFF: point transaction page
    BFF-->>SPA: point transaction page
    SPA->>BFF: GET /api/common/messages?locale=en
    BFF->>Common: GET /messages?locale=en with Authorization: Bearer access_token
    Common-->>BFF: messages page
    BFF-->>SPA: messages page
    SPA->>BFF: GET /api/common/labels?locale=en
    BFF->>Common: GET /labels?locale=en with Authorization: Bearer access_token
    Common-->>BFF: labels page
    BFF-->>SPA: labels page
```

## API Inventory

| Owner | API | Purpose |
| --- | --- | --- |
| SPA -> BFF | `GET /oauth2/authorization/cms-bff` | Start OAuth2 authorization-code login. |
| SPA -> BFF | `GET /api/session` | Bootstrap route protection without reading tokens in JavaScript. |
| SPA -> BFF | `GET /api/me` | Load authenticated user details. |
| SPA -> BFF | `GET /api/csrf` | Load CSRF header/token for unsafe BFF calls. |
| SPA -> BFF | `POST /api/logout` | Invalidate the BFF session. |
| SPA -> BFF -> CMS | `GET /api/cms/articles` | List published CMS articles. |
| SPA -> BFF -> CMS | `GET /api/cms/me/points` | Load current member point balance. |
| SPA -> BFF -> CMS | `GET /api/cms/me/point-transactions` | Load current member point transactions. |
| SPA -> BFF -> Common | `GET /api/common/messages?locale=en` | Load message text entries. |
| SPA -> BFF -> Common | `GET /api/common/labels?locale=en` | Load label text entries. |
| Resource services -> Authorization service | `GET /.well-known/jwks.json` | Retrieve public signing keys for JWT validation. |

## JWT Validation Flow

```mermaid
flowchart LR
    A["Authorization service loads keystore.pkcs12"] --> B["Builds Nimbus RSAKey with private + public key"]
    B --> C["Spring Authorization Server signs access token"]
    C --> D["BFF stores access/refresh token in server-side session"]
    D --> E["BFF forwards resource request with Bearer token"]
    E --> F["Resource server receives JWT"]
    F --> G["Spring Resource Server reads issuer-uri and jwk-set-uri"]
    G --> H["GET http://localhost:9000/.well-known/jwks.json"]
    H --> I["Validate JWT signature, issuer, expiry, scopes, and role claims"]
    I --> J["Controller receives authenticated Jwt principal"]
```

The browser receives only `CMS_BFF_SESSION`. It does not receive the access token or refresh token, and it does not store JWTs in `localStorage`, `sessionStorage`, or JavaScript-readable cookies.

## Core Snippets

### Authorization Service: Build Signing JWK From PKCS12

Source: `authorization-service/src/main/java/com/example/cms/authorization/config/JwkConfig.java`

```java
@Bean
JWKSet jwkSet(JwtProperties properties) throws Exception {
    KeyStore keyStore = KeyStore.getInstance("PKCS12");
    char[] password = properties.passPhrase().toCharArray();

    try (InputStream inputStream = new ClassPathResource("keystore.pkcs12").getInputStream()) {
        keyStore.load(inputStream, password);
    }

    Certificate certificate = keyStore.getCertificate(properties.keyAlias());
    RSAPublicKey publicKey = (RSAPublicKey) certificate.getPublicKey();
    RSAPrivateKey privateKey = (RSAPrivateKey) keyStore.getKey(properties.keyAlias(), password);

    RSAKey rsaKey = new RSAKey.Builder(publicKey)
            .privateKey(privateKey)
            .keyID(properties.keyId())
            .build();

    return new JWKSet(rsaKey);
}
```

### Authorization Service: Publish Public JWKS

Source: `authorization-service/src/main/java/com/example/cms/authorization/jwt/JwksController.java`

```java
@GetMapping("/.well-known/jwks.json")
public Map<String, Object> jwks() {
    return jwkSet.toPublicJWKSet().toJSONObject();
}
```

### Authorization Service: Add User Claims To Access Token

Source: `authorization-service/src/main/java/com/example/cms/authorization/jwt/JwtClaimsConfig.java`

```java
context.getClaims()
        .claim(JwtClaim.USER_ID.claimName(), UUID.nameUUIDFromBytes(username.getBytes()).toString())
        .claim(JwtClaim.EMAIL.claimName(), username)
        .claim(JwtClaim.ROLES.claimName(), roles);
```

### BFF: Relay Access Token To Resource Services

Source: `bff-gateway-service/src/main/java/com/example/cms/bff/proxy/GatewayProxyController.java`

```java
@RequestMapping("/api/cms/**")
public ResponseEntity<byte[]> proxyCms(
        HttpServletRequest request,
        @RegisteredOAuth2AuthorizedClient("cms-bff") OAuth2AuthorizedClient authorizedClient) throws Exception {
    return proxy(request, authorizedClient, cmsServiceUrl, "/api/cms");
}

private ResponseEntity<byte[]> proxy(
        HttpServletRequest request,
        OAuth2AuthorizedClient authorizedClient,
        String serviceBaseUrl,
        String bffPrefix) throws Exception {
    HttpHeaders headers = copyHeaders(request);
    headers.setBearerAuth(authorizedClient.getAccessToken().getTokenValue());
    ...
}
```

### Resource Server: Stateless JWT Security

Source: `cms-resource-service/src/main/java/com/example/cms/resource/config/SecurityConfig.java`

```java
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(AUTH_WHITELIST).permitAll()
                    .anyRequest().authenticated())
            .oauth2ResourceServer(oauth2 -> oauth2
                    .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())))
            .build();
}
```

### Resource Server: JWKS Configuration

Source: `cms-resource-service/src/main/resources/application.yml`

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${JWT_ISSUER:http://localhost:9000}
          jwk-set-uri: ${JWT_JWK_SET_URI:http://localhost:9000/.well-known/jwks.json}
```

### Frontend: Session-Based API Client

Source: `frontend/src/shared/api/http.ts`

```ts
const response = await fetch(path, {
  ...init,
  credentials: 'include',
  headers,
});

if (response.status === 401) {
  window.location.assign('/oauth2/authorization/cms-bff');
  throw new Error('Authentication required');
}
```

## Post-Login Frontend State

```mermaid
stateDiagram-v2
    [*] --> Bootstrapping
    Bootstrapping --> Anonymous: GET /api/session returns authenticated=false
    Anonymous --> LoginRedirect: User clicks Sign in
    LoginRedirect --> Authenticated: BFF sets CMS_BFF_SESSION after authorization code callback
    Bootstrapping --> Authenticated: GET /api/session returns authenticated=true
    Authenticated --> Articles: GET /api/cms/articles
    Authenticated --> Points: GET /api/cms/me/points and /api/cms/me/point-transactions
    Authenticated --> Messages: GET /api/common/messages?locale=en
    Authenticated --> Labels: GET /api/common/labels?locale=en
    Authenticated --> Anonymous: POST /api/logout returns 204
```
