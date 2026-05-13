package com.company.core.modules.users.dto;

import jakarta.validation.constraints.NotBlank;

public record UserRoleAssignRequest(@NotBlank String roleName) {
}
