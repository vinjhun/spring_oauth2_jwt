package com.example.cms.bff.proxy;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
public class GatewayProxyController {

    private final RestTemplate restTemplate;
    private final String cmsServiceUrl;
    private final String commonServiceUrl;

    public GatewayProxyController(
            RestTemplate restTemplate,
            @Value("${services.cms-resource-service.url}") String cmsServiceUrl,
            @Value("${services.common-service.url}") String commonServiceUrl) {
        this.restTemplate = restTemplate;
        this.cmsServiceUrl = cmsServiceUrl;
        this.commonServiceUrl = commonServiceUrl;
    }

    @RequestMapping("/api/cms/**")
    public ResponseEntity<byte[]> proxyCms(
            HttpServletRequest request,
            @RegisteredOAuth2AuthorizedClient("cms-bff") OAuth2AuthorizedClient authorizedClient) throws Exception {
        return proxy(request, authorizedClient, cmsServiceUrl, "/api/cms");
    }

    @RequestMapping("/api/common/**")
    public ResponseEntity<byte[]> proxyCommon(
            HttpServletRequest request,
            @RegisteredOAuth2AuthorizedClient("cms-bff") OAuth2AuthorizedClient authorizedClient) throws Exception {
        return proxy(request, authorizedClient, commonServiceUrl, "/api/common");
    }

    private ResponseEntity<byte[]> proxy(
            HttpServletRequest request,
            OAuth2AuthorizedClient authorizedClient,
            String serviceBaseUrl,
            String bffPrefix) throws Exception {
        byte[] body = StreamUtils.copyToByteArray(request.getInputStream());
        HttpHeaders headers = copyHeaders(request);
        headers.setBearerAuth(authorizedClient.getAccessToken().getTokenValue());

        URI targetUri = targetUri(request, serviceBaseUrl, bffPrefix);
        ResponseEntity<byte[]> response;
        try {
            response = restTemplate.exchange(
                    targetUri,
                    HttpMethod.valueOf(request.getMethod()),
                    new HttpEntity<>(body, headers),
                    byte[].class);
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .headers(ex.getResponseHeaders() == null ? new HttpHeaders() : ex.getResponseHeaders())
                    .body(ex.getResponseBodyAsByteArray());
        }

        return ResponseEntity
                .status(response.getStatusCode())
                .headers(response.getHeaders())
                .body(response.getBody());
    }

    private HttpHeaders copyHeaders(HttpServletRequest request) {
        HttpHeaders headers = new HttpHeaders();
        Collections.list(request.getHeaderNames()).forEach(headerName -> {
            if (!HttpHeaders.HOST.equalsIgnoreCase(headerName)
                    && !HttpHeaders.COOKIE.equalsIgnoreCase(headerName)
                    && !HttpHeaders.AUTHORIZATION.equalsIgnoreCase(headerName)) {
                headers.put(headerName, Collections.list(request.getHeaders(headerName)));
            }
        });
        return headers;
    }

    private URI targetUri(HttpServletRequest request, String serviceBaseUrl, String bffPrefix) {
        String resourcePath = request.getRequestURI().substring(bffPrefix.length());
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromHttpUrl(serviceBaseUrl)
                .path(resourcePath);

        if (request.getQueryString() != null) {
            builder.query(request.getQueryString());
        }

        return builder.build(true).toUri();
    }
}
