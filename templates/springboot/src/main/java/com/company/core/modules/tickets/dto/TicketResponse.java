package com.company.core.modules.tickets.dto;

import com.company.core.modules.tickets.entity.TicketStatus;
import java.time.Instant;
import java.util.UUID;

public record TicketResponse(
    UUID id,
    String subject,
    String description,
    TicketStatus status,
    UUID requesterId,
    String requesterEmail,
    Instant createdAt,
    Instant updatedAt
) {
}
