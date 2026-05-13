package com.company.core.modules.tickets.dto;

public record TicketPatchRequest(
    String subject,
    String description
) {
}
