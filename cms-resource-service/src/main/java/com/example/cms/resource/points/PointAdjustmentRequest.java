package com.example.cms.resource.points;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PointAdjustmentRequest(
        @NotNull Integer delta,
        @NotBlank @Size(max = 500) String reason
) {
}

