package com.company.core.modules.images.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ImageCreateRequest(
    @NotBlank String url,
    @NotBlank String fileName,
    @NotBlank String contentType,
    @NotNull @Min(1) Long sizeBytes,
    Boolean primaryImage,
    Integer sortOrder
) {
}
