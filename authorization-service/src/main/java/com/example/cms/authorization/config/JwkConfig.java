package com.example.cms.authorization.config;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import java.io.InputStream;
import java.security.KeyStore;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.cert.Certificate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

@Configuration
public class JwkConfig {

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

    @Bean
    JWKSource<SecurityContext> jwkSource(JWKSet jwkSet) {
        return (jwkSelector, securityContext) -> jwkSelector.select(jwkSet);
    }
}

