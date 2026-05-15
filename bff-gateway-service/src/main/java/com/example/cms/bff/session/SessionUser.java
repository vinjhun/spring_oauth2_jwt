package com.example.cms.bff.session;

import java.util.Collection;

public record SessionUser(
        String name,
        Collection<String> authorities
) {
}

