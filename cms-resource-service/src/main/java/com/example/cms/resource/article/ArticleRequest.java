package com.example.cms.resource.article;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record ArticleRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 220) String slug,
        @Size(max = 500) String summary,
        @NotBlank @Size(max = 8000) String body,
        ArticleStatus status,
        Instant publishAt,
        String coverImageUrl
) {
}

