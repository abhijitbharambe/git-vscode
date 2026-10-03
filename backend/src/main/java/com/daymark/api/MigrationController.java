package com.daymark.api;

import com.daymark.api.ApiModels.LegacyDataImport;
import com.daymark.api.ApiModels.MigrationStatus;
import com.daymark.service.LegacyDataMigrationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/migration")
public class MigrationController {
    private final LegacyDataMigrationService migrationService;

    public MigrationController(LegacyDataMigrationService migrationService) {
        this.migrationService = migrationService;
    }

    @GetMapping("/status")
    public MigrationStatus status() {
        return new MigrationStatus(migrationService.isImported());
    }

    @PostMapping("/import")
    public MigrationStatus importLegacyData(@RequestBody LegacyDataImport request) {
        migrationService.importOnce(request);
        return new MigrationStatus(true);
    }
}