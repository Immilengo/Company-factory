package com.company.core.modules.tickets.dto;

import jakarta.validation.constraints.NotBlank;

public record RoleAssignRequest(@NotBlank String roleName) {
}
