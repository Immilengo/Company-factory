package com.company.core.modules.statuses.dto;

public record StatusPatchRequest(
    String code,
    String name,
    String description,
    Boolean active
) {
}
