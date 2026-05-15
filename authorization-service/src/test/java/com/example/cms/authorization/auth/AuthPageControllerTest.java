package com.example.cms.authorization.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.servlet.view.RedirectView;

class AuthPageControllerTest {

    @Test
    void loginRedirectsToReactLoginPage() {
        RedirectView redirectView = new AuthPageController("http://localhost:5173/login").login(new LinkedMultiValueMap<>());

        assertThat(redirectView.getUrl()).isEqualTo("http://localhost:5173/login?flow=login");
    }

    @Test
    void loginPreservesSpringSecurityLoginFlags() {
        LinkedMultiValueMap<String, String> parameters = new LinkedMultiValueMap<>();
        parameters.add("error", "");

        RedirectView redirectView = new AuthPageController("http://localhost:5173/login").login(parameters);

        assertThat(redirectView.getUrl()).isEqualTo("http://localhost:5173/login?flow=login&error=");
    }
}
