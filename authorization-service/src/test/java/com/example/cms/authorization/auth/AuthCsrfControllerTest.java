package com.example.cms.authorization.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.security.web.csrf.DefaultCsrfToken;

class AuthCsrfControllerTest {

    @Test
    void csrfReturnsFormParameterAndHeaderMetadata() {
        DefaultCsrfToken token = new DefaultCsrfToken("X-CSRF-TOKEN", "_csrf", "test-token");

        Map<String, String> response = new AuthCsrfController().csrf(token);

        assertThat(response)
                .containsEntry("parameterName", "_csrf")
                .containsEntry("headerName", "X-CSRF-TOKEN")
                .containsEntry("token", "test-token");
    }
}
