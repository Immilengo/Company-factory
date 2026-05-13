package com.company.core.modules.roles.dto;

public record RolePatchRequest(
    String name,
    Boolean active
) {
}
