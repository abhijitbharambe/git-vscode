package com.daymark.service;

import com.daymark.api.ApiModels.LegacyDataImport;
import com.daymark.api.ApiModels.LegacyJournalEntry;
import com.daymark.api.ApiModels.LegacyTodo;
import com.daymark.model.JournalEntry;
import com.daymark.model.MigrationMarker;
import com.daymark.model.Todo;
import com.daymark.repository.JournalEntryRepository;
import com.daymark.repository.MigrationMarkerRepository;
import com.daymark.repository.TodoRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LegacyDataMigrationService {
    private static final String MIGRATION_ID = "browser-storage-v1";

    private final JournalEntryRepository entries;
    private final TodoRepository todos;
    private final MigrationMarkerRepository markers;

    public LegacyDataMigrationService(
            JournalEntryRepository entries,
            TodoRepository todos,
            MigrationMarkerRepository markers) {
        this.entries = entries;
        this.todos = todos;
        this.markers = markers;
    }

    public boolean isImported() {
        return markers.existsById(MIGRATION_ID);
    }

    @Transactional
    public void importOnce(LegacyDataImport request) {
        if (markers.existsById(MIGRATION_ID)) return;

        List<LegacyJournalEntry> legacyEntries = request.journalEntries() == null
                ? List.of()
                : request.journalEntries();
        List<LegacyTodo> legacyTodos = request.todos() == null
                ? List.of()
                : request.todos();

                for (LegacyJournalEntry entry : legacyEntries) {
                        if (entry != null && entry.content() != null && !entry.content().isBlank()) {
                                entries.save(new JournalEntry(
                                                entry.content(), entry.createdAt() == null ? Instant.now() : entry.createdAt()));
                        }
                }
                for (LegacyTodo todo : legacyTodos) {
                        if (todo != null && todo.text() != null && !todo.text().isBlank()) {
                                todos.save(new Todo(todo.text(), todo.done()));
                        }
                }
        markers.save(new MigrationMarker(MIGRATION_ID));
    }
}