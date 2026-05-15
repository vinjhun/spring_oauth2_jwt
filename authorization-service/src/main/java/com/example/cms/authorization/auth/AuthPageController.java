package com.example.cms.authorization.auth;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.UriComponentsBuilder;

@Controller
public class AuthPageController {

    private final String frontendLoginUrl;

    public AuthPageController(@Value("${cms.auth.frontend-login-url:http://localhost:5173/login}") String frontendLoginUrl) {
        this.frontendLoginUrl = frontendLoginUrl;
    }

    @GetMapping("/login")
    public RedirectView login(@RequestParam MultiValueMap<String, String> parameters) {
        UriComponentsBuilder redirectUrl = UriComponentsBuilder.fromUriString(frontendLoginUrl);
        redirectUrl.queryParam("flow", "login");
        for (Map.Entry<String, List<String>> parameter : parameters.entrySet()) {
            redirectUrl.queryParam(parameter.getKey(), parameter.getValue().toArray());
        }

        RedirectView redirectView = new RedirectView(redirectUrl.build().toUriString());
        redirectView.setExposeModelAttributes(false);
        return redirectView;
    }
}
