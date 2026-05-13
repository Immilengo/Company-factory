package com.company.core.modules.statuses.service;

import com.company.core.exceptions.NotFoundException;
import com.company.core.modules.common.enums.RecordStatusFilter;
import com.company.core.modules.statuses.dto.StatusPatchRequest;
import com.company.core.modules.statuses.dto.StatusRequest;
import com.company.core.modules.statuses.entity.StatusEntity;
import com.company.core.modules.statuses.repository.StatusRepository;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;

@Service
public class StatusService {

    private final StatusRepository statusRepository;

    public StatusService(StatusRepository statusRepository) {
        this.statusRepository = statusRepository;
    }

    public StatusEntity create(StatusRequest request) {
        StatusEntity status = new StatusEntity();
        status.setId(UUID.randomUUID());
        status.setCode(request.code().toUpperCase(Locale.ROOT));
        status.setName(request.name());
        status.setDescription(request.description());
        return statusRepository.save(status);
    }

    public List<StatusEntity> list(RecordStatusFilter recordStatus) {
        return switch (recordStatus) {
            case ACTIVE -> statusRepository.findByDeletedFalse();
            case INACTIVE -> statusRepository.findByDeletedTrue();
            case ALL -> statusRepository.findAll();
        };
    }

    public StatusEntity get(UUID id) {
        return statusRepository.findById(id).orElseThrow(() -> new NotFoundException("Status not found"));
    }

    public StatusEntity getByCode(String code) {
        String normalized = code.toUpperCase(Locale.ROOT);
        return statusRepository.findByCodeAndDeletedFalse(normalized).orElseGet(() -> {
            StatusEntity status = new StatusEntity();
            status.setId(UUID.randomUUID());
            status.setCode(normalized);
            status.setName(normalized);
            status.setDescription("Auto-created status " + normalized);
            return statusRepository.save(status);
        });
    }

    public StatusEntity update(UUID id, StatusRequest request) {
        StatusEntity status = get(id);
        status.setCode(request.code().toUpperCase(Locale.ROOT));
        status.setName(request.name());
        status.setDescription(request.description());
        return statusRepository.save(status);
    }

    public StatusEntity patch(UUID id, StatusPatchRequest request) {
        StatusEntity status = get(id);
        if (request.code() != null && !request.code().isBlank()) {
            status.setCode(request.code().toUpperCase(Locale.ROOT));
        }
        if (request.name() != null && !request.name().isBlank()) {
            status.setName(request.name());
        }
        if (request.description() != null) {
            status.setDescription(request.description());
        }
        if (request.active() != null) {
            status.setDeleted(!request.active());
        }
        return statusRepository.save(status);
    }

    public void softDelete(UUID id) {
        StatusEntity status = get(id);
        status.setDeleted(true);
        statusRepository.save(status);
    }

    @Configuration
    static class StatusSeeder {
        @Bean
        ApplicationRunner seedDefaultStatuses(StatusRepository statusRepository) {
            return args -> List.of("ACTIVE", "INACTIVE", "BLOCKED", "PENDING", "DELETED").forEach(code -> {
                statusRepository.findByCodeAndDeletedFalse(code).orElseGet(() -> {
                    StatusEntity status = new StatusEntity();
                    status.setId(UUID.randomUUID());
                    status.setCode(code);
                    status.setName(code);
                    status.setDescription("Default status " + code);
                    return statusRepository.save(status);
                });
            });
        }
    }
}
