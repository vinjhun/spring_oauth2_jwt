package com.example.cms.resource.article;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
public class ArticleController {

    private final ArticleRepository repository;

    public ArticleController(ArticleRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/articles")
    public Page<Article> publishedArticles(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        return repository.findByStatus(ArticleStatus.PUBLISHED, PageRequest.of(page, size));
    }

    @GetMapping("/articles/{slug}")
    public Article publishedArticle(@PathVariable(name = "slug") String slug) {
        Article article = repository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (article.getStatus() != ArticleStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return article;
    }

    @GetMapping("/admin/articles")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<Article> adminArticles(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        return repository.findAll(PageRequest.of(page, size));
    }

    @PostMapping("/admin/articles")
    @PreAuthorize("hasRole('ADMIN')")
    public Article createArticle(@Valid @RequestBody ArticleRequest request) {
        Article article = new Article();
        apply(article, request);
        return repository.save(article);
    }

    @PatchMapping("/admin/articles/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Article updateArticle(@PathVariable(name = "id") Long id, @Valid @RequestBody ArticleRequest request) {
        Article article = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        apply(article, request);
        return repository.save(article);
    }

    private void apply(Article article, ArticleRequest request) {
        article.setTitle(request.title());
        article.setSlug(request.slug());
        article.setSummary(request.summary());
        article.setBody(request.body());
        article.setStatus(request.status() == null ? ArticleStatus.DRAFT : request.status());
        article.setPublishAt(request.publishAt());
        article.setCoverImageUrl(request.coverImageUrl());
    }
}
