package com.example.cms.resource;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableMethodSecurity
public class CmsResourceServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CmsResourceServiceApplication.class, args);
    }
}

