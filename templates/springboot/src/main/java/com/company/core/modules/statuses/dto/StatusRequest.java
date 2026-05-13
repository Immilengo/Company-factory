package com.company.core.modules.statuses.dto;

import jakarta.validation.constraints.NotBlank;

public record StatusRequest(
    @NotBlank String code,
    @NotBlank String name,
    String description
) {
}
