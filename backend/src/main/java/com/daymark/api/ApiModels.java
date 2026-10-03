package com.daymark.api;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;

public final class ApiModels {
    private ApiModels() {
    }

    public record CreateJournalEntry(@NotBlank String content) {
    }

    public record CreateTodo(@NotBlank String text) {
    }

    public record UpdateTodoStatus(boolean done) {
    }

    public record MigrationStatus(boolean imported) {
    }

    public record LegacyJournalEntry(Long id, String content, Instant createdAt) {
    }

    public record LegacyTodo(Long id, String text, boolean done) {
    }

    public record LegacyDataImport(List<LegacyJournalEntry> journalEntries, List<LegacyTodo> todos) {
    }
}