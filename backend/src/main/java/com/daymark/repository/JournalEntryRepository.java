package com.daymark.repository;

import com.daymark.model.JournalEntry;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    List<JournalEntry> findAllByOrderByCreatedAtDesc();
}