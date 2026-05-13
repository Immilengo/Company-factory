package com.company.core.modules.tickets.dto;

import com.company.core.modules.tickets.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record TicketStatusPatchRequest(@NotNull TicketStatus status) {
}
