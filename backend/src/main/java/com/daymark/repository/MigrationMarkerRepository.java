package com.daymark.repository;

import com.daymark.model.MigrationMarker;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MigrationMarkerRepository extends JpaRepository<MigrationMarker, String> {
}