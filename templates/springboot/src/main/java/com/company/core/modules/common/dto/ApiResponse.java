package com.company.core.modules.common.dto;

import lombok.Builder;

@Builder
public record ApiResponse<T>(boolean success, String message, T data) {
}
