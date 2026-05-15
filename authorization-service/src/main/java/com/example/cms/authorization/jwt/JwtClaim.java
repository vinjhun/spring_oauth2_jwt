package com.example.cms.authorization.jwt;

public enum JwtClaim {
    USER_ID("userId"),
    EMAIL("email"),
    ROLES("roles");

    private final String claimName;

    JwtClaim(String claimName) {
        this.claimName = claimName;
    }

    public String claimName() {
        return claimName;
    }
}

