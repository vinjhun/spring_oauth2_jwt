package com.example.cms.authorization.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cms.jwt")
public record JwtProperties(
        String keyId,
        String keyAlias,
        String issuer,
        String passPhrase,
        long accessTokenLifeTimeMs,
        long refreshTokenLifeTimeMs
) {
}

