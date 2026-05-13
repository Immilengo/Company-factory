package com.company.core.modules.common.dto;

import java.util.List;
import lombok.Builder;

@Builder
public record ApiErrorResponse(boolean success, String message, List<String> errors) {
}
