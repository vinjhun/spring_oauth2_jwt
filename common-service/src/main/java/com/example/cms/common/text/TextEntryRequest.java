package com.example.cms.common.text;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TextEntryRequest(
        @NotNull TextEntryType type,
        @NotBlank @Size(max = 180) String textKey,
        @NotBlank @Size(max = 20) String locale,
        @NotBlank @Size(max = 1000) String textValue
) {
}

