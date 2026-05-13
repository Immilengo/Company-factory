package com.company.core.modules.tickets.controller;

import com.company.core.modules.common.dto.ApiResponse;
import com.company.core.modules.common.enums.RecordStatusFilter;
import com.company.core.modules.tickets.dto.TicketCreateRequest;
import com.company.core.modules.tickets.dto.TicketPatchRequest;
import com.company.core.modules.tickets.dto.TicketResponse;
import com.company.core.modules.tickets.dto.TicketStatusPatchRequest;
import com.company.core.modules.tickets.entity.Ticket;
import com.company.core.modules.tickets.entity.TicketStatus;
import com.company.core.modules.tickets.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@Tag(name = "Tickets", description = "Abertura e acompanhamento de tickets por usuarios e administradores")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    @Operation(summary = "Criar ticket", description = "Permite a qualquer usuario autenticado criar um ticket com assunto e descricao.")
    public ResponseEntity<ApiResponse<TicketResponse>> create(@Valid @RequestBody TicketCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.<TicketResponse>builder()
            .success(true)
            .message("Ticket created successfully")
            .data(toResponse(ticketService.create(request)))
            .build());
    }

    @GetMapping
    @Operation(summary = "Listar tickets", description = "Admin lista todos, usuario comum lista apenas os seus. Permite filtrar por status do ticket e status do registo (ACTIVE/INACTIVE/ALL).")
    public ResponseEntity<ApiResponse<Page<TicketResponse>>> list(
        @RequestParam(defaultValue = "0") @Min(0) Integer page,
        @RequestParam(defaultValue = "10") @Min(1) @Max(100) Integer size,
        @RequestParam(defaultValue = "createdAt") @Pattern(regexp = "subject|status|createdAt|updatedAt") String sortBy,
        @RequestParam(defaultValue = "desc") @Pattern(regexp = "asc|desc") String direction,
        @RequestParam(required = false) TicketStatus status,
        @RequestParam(defaultValue = "ACTIVE") RecordStatusFilter recordStatus
    ) {
        return ResponseEntity.ok(ApiResponse.<Page<TicketResponse>>builder()
            .success(true)
            .message("Tickets retrieved successfully")
            .data(ticketService.list(page, size, sortBy, direction, status, recordStatus).map(this::toResponse))
            .build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhar ticket", description = "Admin pode ver qualquer ticket, usuario comum apenas tickets proprios.")
    public ResponseEntity<ApiResponse<TicketResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.<TicketResponse>builder()
            .success(true)
            .message("Ticket retrieved successfully")
            .data(toResponse(ticketService.get(id)))
            .build());
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualizar ticket parcialmente", description = "Permite alterar assunto e/ou descricao de forma parcial. Usuario comum apenas nos proprios tickets nao finalizados.")
    public ResponseEntity<ApiResponse<TicketResponse>> patch(@PathVariable UUID id, @Valid @RequestBody TicketPatchRequest request) {
        return ResponseEntity.ok(ApiResponse.<TicketResponse>builder()
            .success(true)
            .message("Ticket updated successfully")
            .data(toResponse(ticketService.patch(id, request)))
            .build());
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status do ticket", description = "Somente ADMIN pode alterar status do ticket para PENDENTE, PROCESSANDO, RESOLVIDO ou FECHADO.")
    public ResponseEntity<ApiResponse<TicketResponse>> patchStatus(@PathVariable UUID id, @Valid @RequestBody TicketStatusPatchRequest request) {
        return ResponseEntity.ok(ApiResponse.<TicketResponse>builder()
            .success(true)
            .message("Ticket status updated successfully")
            .data(toResponse(ticketService.updateStatus(id, request)))
            .build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desativar ticket (soft delete)", description = "Marca ticket como removido sem apagar fisicamente o registo.")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        ticketService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Ticket deleted successfully").build());
    }

    private TicketResponse toResponse(Ticket ticket) {
        return new TicketResponse(
            ticket.getId(),
            ticket.getSubject(),
            ticket.getDescription(),
            ticket.getStatus(),
            ticket.getRequester().getId(),
            ticket.getRequester().getEmail(),
            ticket.getCreatedAt(),
            ticket.getUpdatedAt()
        );
    }
}
