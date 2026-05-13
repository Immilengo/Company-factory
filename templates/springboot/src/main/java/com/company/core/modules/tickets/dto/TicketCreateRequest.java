package com.company.core.modules.tickets.dto;

import jakarta.validation.constraints.NotBlank;

public record TicketCreateRequest(
    @NotBlank String subject,
    @NotBlank String description
) {
}
