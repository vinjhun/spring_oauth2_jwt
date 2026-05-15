package com.example.cms.common.text;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TextEntryRepository extends JpaRepository<TextEntry, Long> {

    Page<TextEntry> findByTypeAndLocale(TextEntryType type, String locale, Pageable pageable);

    Optional<TextEntry> findByTypeAndTextKeyAndLocale(TextEntryType type, String textKey, String locale);
}

