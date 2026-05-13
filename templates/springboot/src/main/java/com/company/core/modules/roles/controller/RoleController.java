package com.company.core.modules.roles.controller;

import com.company.core.modules.common.dto.ApiResponse;
import com.company.core.modules.common.enums.RecordStatusFilter;
import com.company.core.modules.roles.dto.RolePatchRequest;
import com.company.core.modules.roles.dto.RoleRequest;
import com.company.core.modules.roles.dto.RoleResponse;
import com.company.core.modules.roles.mapper.RoleMapper;
import com.company.core.modules.roles.service.RoleService;
import com.company.core.security.annotations.IsAdmin;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/roles")
@Tag(name = "Roles", description = "Gestao de perfis de acesso do sistema")
public class RoleController {

    private final RoleService roleService;
    private final RoleMapper roleMapper;

    public RoleController(RoleService roleService, RoleMapper roleMapper) {
        this.roleService = roleService;
        this.roleMapper = roleMapper;
    }

    @PostMapping
    @IsAdmin
    @Operation(summary = "Criar role", description = "Cria um novo perfil de acesso.")
    public ResponseEntity<ApiResponse<RoleResponse>> create(@Valid @RequestBody RoleRequest request) {
        return ResponseEntity.ok(ApiResponse.<RoleResponse>builder().success(true).message("Role created successfully")
            .data(roleMapper.toResponse(roleService.create(request))).build());
    }

    @GetMapping
    @Operation(summary = "Listar roles", description = "Lista perfis por estado do registo: ACTIVE, INACTIVE ou ALL.")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> list(@RequestParam(defaultValue = "ACTIVE") RecordStatusFilter recordStatus) {
        return ResponseEntity.ok(ApiResponse.<List<RoleResponse>>builder().success(true).message("Roles retrieved successfully")
            .data(roleService.list(recordStatus).stream().map(roleMapper::toResponse).toList()).build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhar role", description = "Retorna os dados completos de uma role por ID.")
    public ResponseEntity<ApiResponse<RoleResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.<RoleResponse>builder().success(true).message("Role retrieved successfully")
            .data(roleMapper.toResponse(roleService.get(id))).build());
    }

    @PutMapping("/{id}")
    @IsAdmin
    @Operation(summary = "Atualizar role (completo)", description = "Atualiza completamente os dados da role.")
    public ResponseEntity<ApiResponse<RoleResponse>> update(@PathVariable UUID id, @Valid @RequestBody RoleRequest request) {
        return ResponseEntity.ok(ApiResponse.<RoleResponse>builder().success(true).message("Role updated successfully")
            .data(roleMapper.toResponse(roleService.update(id, request))).build());
    }

    @PatchMapping("/{id}")
    @IsAdmin
    @Operation(summary = "Atualizar role parcialmente", description = "Atualiza apenas os campos enviados; permite ativar/desativar (soft status).")
    public ResponseEntity<ApiResponse<RoleResponse>> patch(@PathVariable UUID id, @Valid @RequestBody RolePatchRequest request) {
        return ResponseEntity.ok(ApiResponse.<RoleResponse>builder().success(true).message("Role patched successfully")
            .data(roleMapper.toResponse(roleService.patch(id, request))).build());
    }

    @DeleteMapping("/{id}")
    @IsAdmin
    @Operation(summary = "Desativar role (soft delete)", description = "Marca a role como inativa sem remover fisicamente do banco.")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        roleService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Role deleted successfully").build());
    }
}
