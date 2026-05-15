package com.example.cms.common.text;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class TextEntryController {

    private final TextEntryRepository repository;

    public TextEntryController(TextEntryRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/messages")
    public Page<TextEntry> messages(
            @RequestParam(name = "locale", defaultValue = "en") String locale,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "100") int size) {
        return repository.findByTypeAndLocale(TextEntryType.MESSAGE, locale, PageRequest.of(page, size));
    }

    @GetMapping("/labels")
    public Page<TextEntry> labels(
            @RequestParam(name = "locale", defaultValue = "en") String locale,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "100") int size) {
        return repository.findByTypeAndLocale(TextEntryType.LABEL, locale, PageRequest.of(page, size));
    }

    @PostMapping("/admin/text-entries")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public TextEntry create(@Valid @RequestBody TextEntryRequest request) {
        TextEntry entry = new TextEntry();
        apply(entry, request);
        return repository.save(entry);
    }

    @PatchMapping("/admin/text-entries/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TextEntry update(@PathVariable(name = "id") Long id, @Valid @RequestBody TextEntryRequest request) {
        TextEntry entry = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        apply(entry, request);
        return repository.save(entry);
    }

    private void apply(TextEntry entry, TextEntryRequest request) {
        entry.setType(request.type());
        entry.setTextKey(request.textKey());
        entry.setLocale(request.locale());
        entry.setTextValue(request.textValue());
    }
}
