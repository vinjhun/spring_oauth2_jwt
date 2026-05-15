package com.example.cms.bff.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    private static final String[] PUBLIC_PATHS = {
            "/",
            "/index.html",
            "/assets/**",
            "/favicon.ico",
            "/api/session",
            "/api/csrf",
            "/api/logout",
            "/actuator/health",
            "/actuator/info"
    };

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Value("${bff.frontend-url}") String frontendUrl) throws Exception {
        return http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_PATHS).permitAll()
                        .anyRequest().authenticated())
                .csrf(Customizer.withDefaults())
                .oauth2Login(oauth2 -> oauth2.defaultSuccessUrl(frontendUrl, true))
                .oauth2Client(Customizer.withDefaults())
                .logout(logout -> logout.disable())
                .build();
    }
}
