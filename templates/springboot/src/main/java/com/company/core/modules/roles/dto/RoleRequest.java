package com.company.core.modules.roles.dto;

import jakarta.validation.constraints.NotBlank;

public record RoleRequest(@NotBlank String name) {
}
