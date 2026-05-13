package com.company.core.modules.statuses.controller;

import com.company.core.modules.common.dto.ApiResponse;
import com.company.core.modules.common.enums.RecordStatusFilter;
import com.company.core.modules.statuses.dto.StatusPatchRequest;
import com.company.core.modules.statuses.dto.StatusRequest;
import com.company.core.modules.statuses.dto.StatusResponse;
import com.company.core.modules.statuses.entity.StatusEntity;
import com.company.core.modules.statuses.service.StatusService;
import com.company.core.security.annotations.IsAdmin;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/statuses")
@Tag(name = "Statuses", description = "Gestao de status de negocio reutilizaveis nas entidades")
public class StatusController {

    private final StatusService statusService;

    public StatusController(StatusService statusService) {
        this.statusService = statusService;
    }

    @PostMapping
    @IsAdmin
    @Operation(summary = "Criar status", description = "Cria um novo status de negocio.")
    public ResponseEntity<ApiResponse<StatusResponse>> create(@Valid @RequestBody StatusRequest request) {
        return ResponseEntity.ok(ApiResponse.<StatusResponse>builder().success(true).message("Status created successfully")
            .data(toResponse(statusService.create(request))).build());
    }

    @GetMapping
    @Operation(summary = "Listar status", description = "Lista status filtrando por estado do registo: ACTIVE, INACTIVE ou ALL.")
    public ResponseEntity<ApiResponse<List<StatusResponse>>> list(@RequestParam(defaultValue = "ACTIVE") RecordStatusFilter recordStatus) {
        return ResponseEntity.ok(ApiResponse.<List<StatusResponse>>builder().success(true).message("Statuses retrieved successfully")
            .data(statusService.list(recordStatus).stream().map(this::toResponse).toList()).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhar status", description = "Retorna dados de um status por ID.")
    public ResponseEntity<ApiResponse<StatusResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.<StatusResponse>builder().success(true).message("Status retrieved successfully")
            .data(toResponse(statusService.get(id))).build());
    }

    @PutMapping("/{id}")
    @IsAdmin
    @Operation(summary = "Atualizar status (completo)", description = "Atualiza todos os campos do status informado.")
    public ResponseEntity<ApiResponse<StatusResponse>> update(@PathVariable UUID id, @Valid @RequestBody StatusRequest request) {
        return ResponseEntity.ok(ApiResponse.<StatusResponse>builder().success(true).message("Status updated successfully")
            .data(toResponse(statusService.update(id, request))).build());
    }

    @PatchMapping("/{id}")
    @IsAdmin
    @Operation(summary = "Atualizar status parcialmente", description = "Atualiza parcialmente code, name, description e estado ativo/inativo.")
    public ResponseEntity<ApiResponse<StatusResponse>> patch(@PathVariable UUID id, @Valid @RequestBody StatusPatchRequest request) {
        return ResponseEntity.ok(ApiResponse.<StatusResponse>builder().success(true).message("Status patched successfully")
            .data(toResponse(statusService.patch(id, request))).build());
    }

    @DeleteMapping("/{id}")
    @IsAdmin
    @Operation(summary = "Desativar status (soft delete)", description = "Marca status como inativo sem remoção fisica.")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        statusService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Status deleted successfully").build());
    }

    private StatusResponse toResponse(StatusEntity status) {
        return new StatusResponse(status.getId(), status.getCode(), status.getName(), status.getDescription(), status.getCreatedAt(), status.getUpdatedAt());
    }
}
