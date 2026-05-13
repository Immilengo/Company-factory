package com.company.core.modules.images.dto;

import com.company.core.modules.images.entity.ImageOwnerType;
import java.time.Instant;
import java.util.UUID;

public record ImageResponse(
    UUID id,
    ImageOwnerType ownerType,
    UUID ownerId,
    String url,
    String fileName,
    String contentType,
    Long sizeBytes,
    Boolean primaryImage,
    Integer sortOrder,
    Instant createdAt,
    Instant updatedAt
) {
}
