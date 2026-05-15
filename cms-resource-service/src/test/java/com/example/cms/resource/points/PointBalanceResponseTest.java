package com.example.cms.resource.points;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class PointBalanceResponseTest {

    @Test
    void exposesMemberBalanceWithoutTokenData() {
        PointBalanceResponse response = new PointBalanceResponse("member-1", 120);

        assertThat(response.memberId()).isEqualTo("member-1");
        assertThat(response.balance()).isEqualTo(120);
    }
}

