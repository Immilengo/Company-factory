package com.company.core.modules.users.dto;

import com.company.core.modules.images.dto.ImageResponse;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record UserResponse(
    UUID id,
    String fullName,
    String email,
    String phone,
    String status,
    Boolean emailVerified,
    Set<String> roles,
    ImageResponse profileImage,
    Instant createdAt,
    Instant updatedAt
) {
}
