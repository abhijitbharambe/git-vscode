package com.daymark.api;

import com.daymark.api.ApiModels.CreateJournalEntry;
import com.daymark.model.JournalEntry;
import com.daymark.repository.JournalEntryRepository;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/journal")
public class JournalController {
    private final JournalEntryRepository entries;

    public JournalController(JournalEntryRepository entries) {
        this.entries = entries;
    }

    @GetMapping
    public List<JournalEntry> listEntries() {
        return entries.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public JournalEntry createEntry(@Valid @RequestBody CreateJournalEntry request) {
        return entries.save(new JournalEntry(request.content().trim(), Instant.now()));
    }
}