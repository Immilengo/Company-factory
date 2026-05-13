package com.company.core.modules.statuses.dto;

import java.time.Instant;
import java.util.UUID;

public record StatusResponse(
    UUID id,
    String code,
    String name,
    String description,
    Instant createdAt,
    Instant updatedAt
) {
}
