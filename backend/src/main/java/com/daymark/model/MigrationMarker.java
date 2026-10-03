package com.daymark.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "migration_markers")
public class MigrationMarker {
    @Id
    private String id;

    protected MigrationMarker() {
    }

    public MigrationMarker(String id) {
        this.id = id;
    }
}