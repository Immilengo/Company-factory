package com.company.core.modules.users.controller;

import com.company.core.modules.common.dto.ApiResponse;
import com.company.core.modules.common.enums.RecordStatusFilter;
import com.company.core.modules.images.dto.ImageCreateRequest;
import com.company.core.modules.images.dto.ImageResponse;
import com.company.core.modules.images.entity.ImageAsset;
import com.company.core.modules.images.entity.ImageOwnerType;
import com.company.core.modules.images.mapper.ImageAssetMapper;
import com.company.core.modules.images.service.ImageAssetService;
import com.company.core.modules.users.dto.UserPatchRequest;
import com.company.core.modules.users.dto.UserRequest;
import com.company.core.modules.users.dto.UserResponse;
import com.company.core.modules.users.dto.UserRoleAssignRequest;
import com.company.core.modules.users.entity.User;
import com.company.core.modules.users.service.UserService;
import com.company.core.security.SecurityUtils;
import com.company.core.security.annotations.IsAdmin;
import com.company.core.security.annotations.IsAdminOrManager;
import com.company.core.security.annotations.IsSelfOrAdmin;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Gestao de usuarios, perfis e imagem de perfil")
public class UserController {

    private final UserService userService;
    private final ImageAssetService imageAssetService;
    private final ImageAssetMapper imageAssetMapper;
    private final SecurityUtils securityUtils;

    public UserController(UserService userService, ImageAssetService imageAssetService, ImageAssetMapper imageAssetMapper, SecurityUtils securityUtils) {
        this.userService = userService;
        this.imageAssetService = imageAssetService;
        this.imageAssetMapper = imageAssetMapper;
        this.securityUtils = securityUtils;
    }

    @PostMapping
    @IsAdmin
    @Operation(summary = "Criar usuario", description = "Cria usuario manualmente (uso administrativo).")
    public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder().success(true).message("User created successfully")
            .data(toResponse(userService.create(request))).build());
    }

    @GetMapping
    @IsAdminOrManager
    @Operation(summary = "Listar usuarios", description = "Lista usuarios com paginacao, filtro por status de negocio e status do registo (ACTIVE/INACTIVE/ALL).")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> list(
        @RequestParam(defaultValue = "0") @Min(0) Integer page,
        @RequestParam(defaultValue = "10") @Min(1) @Max(100) Integer size,
        @RequestParam(defaultValue = "createdAt") @Pattern(regexp = "fullName|email|createdAt|updatedAt") String sortBy,
        @RequestParam(defaultValue = "desc") @Pattern(regexp = "asc|desc") String direction,
        @RequestParam(required = false) UUID statusId,
        @RequestParam(defaultValue = "ACTIVE") RecordStatusFilter recordStatus
    ) {
        return ResponseEntity.ok(ApiResponse.<Page<UserResponse>>builder().success(true).message("Users retrieved successfully")
            .data(userService.list(page, size, sortBy, direction, statusId, recordStatus).map(this::toResponse)).build());
    }

    @GetMapping("/{id}")
    @IsSelfOrAdmin
    @Operation(summary = "Detalhar usuario", description = "Retorna dados completos de um usuario por ID.")
    public ResponseEntity<ApiResponse<UserResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder().success(true).message("User retrieved successfully")
            .data(toResponse(userService.get(id))).build());
    }

    @GetMapping("/me")
    @Operation(summary = "Perfil atual", description = "Retorna dados do usuario autenticado.")
    public ResponseEntity<ApiResponse<UserResponse>> me() {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder().success(true).message("Current user profile retrieved successfully")
            .data(toResponse(securityUtils.getCurrentUser())).build());
    }

    @PatchMapping("/{id}")
    @IsSelfOrAdmin
    @Operation(summary = "Atualizar usuario parcialmente", description = "Atualiza apenas campos enviados; permite alterar status e ativacao/desativacao logica.")
    public ResponseEntity<ApiResponse<UserResponse>> patch(@PathVariable UUID id, @Valid @RequestBody UserPatchRequest request) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder().success(true).message("User updated successfully")
            .data(toResponse(userService.patch(id, request))).build());
    }

    @PatchMapping("/{id}/roles")
    @IsAdmin
    @Operation(summary = "Adicionar role ao usuario", description = "Apenas ADMIN pode adicionar um novo role a um usuario.")
    public ResponseEntity<ApiResponse<UserResponse>> addRole(@PathVariable UUID id, @Valid @RequestBody UserRoleAssignRequest request) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder().success(true).message("Role added successfully")
            .data(toResponse(userService.addRole(id, request.roleName()))).build());
    }

    @DeleteMapping("/{id}")
    @IsAdmin
    @Operation(summary = "Desativar usuario (soft delete)", description = "Desativa logicamente o usuario sem apagar fisicamente do banco.")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        userService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("User deleted successfully").build());
    }

    @PostMapping(value = "/{id}/profile-image", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE})
    @IsSelfOrAdmin
    @Operation(summary = "Atualizar foto de perfil", description = "Aceita URL ou ficheiro via form-data para facilitar teste no Swagger.")
    public ResponseEntity<ApiResponse<ImageResponse>> uploadProfileImage(
        @PathVariable UUID id,
        @Parameter(description = "URL da imagem") @RequestParam(required = false) String url,
        @Parameter(description = "Ficheiro da imagem") @RequestPart(required = false) MultipartFile file,
        @RequestParam(required = false) Integer sortOrder
    ) {
        if ((url == null || url.isBlank()) && (file == null || file.isEmpty())) {
            throw new IllegalArgumentException("Provide either url or file");
        }

        String resolvedUrl = url;
        String fileName;
        String contentType;
        long sizeBytes;

        if (file != null && !file.isEmpty()) {
            fileName = file.getOriginalFilename() == null ? "upload.bin" : file.getOriginalFilename();
            contentType = file.getContentType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : file.getContentType();
            sizeBytes = file.getSize();
            if (resolvedUrl == null || resolvedUrl.isBlank()) {
                resolvedUrl = "uploaded://" + UUID.randomUUID() + "/" + fileName;
            }
        } else {
            fileName = "remote-file";
            contentType = "application/octet-stream";
            sizeBytes = 1L;
        }

        ImageCreateRequest profileImageRequest = new ImageCreateRequest(resolvedUrl, fileName, contentType, sizeBytes, true, sortOrder);
        ImageAsset image = imageAssetService.create(ImageOwnerType.USER, id, profileImageRequest);
        return ResponseEntity.ok(ApiResponse.<ImageResponse>builder().success(true).message("Profile image updated successfully")
            .data(imageAssetMapper.toResponse(image)).build());
    }

    @GetMapping("/{id}/profile-image")
    @IsSelfOrAdmin
    @Operation(summary = "Obter foto de perfil", description = "Retorna imagem principal do usuario.")
    public ResponseEntity<ApiResponse<ImageResponse>> getProfileImage(@PathVariable UUID id) {
        ImageAsset profileImage = imageAssetService.getPrimary(ImageOwnerType.USER, id);
        return ResponseEntity.ok(ApiResponse.<ImageResponse>builder().success(true).message("Profile image retrieved successfully")
            .data(profileImage == null ? null : imageAssetMapper.toResponse(profileImage)).build());
    }

    private UserResponse toResponse(User user) {
        ImageAsset profileImage = imageAssetService.getPrimary(ImageOwnerType.USER, user.getId());
        return new UserResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getStatus() == null ? null : user.getStatus().getCode(),
            user.getEmailVerified(),
            user.getRoles().stream().map(role -> role.getName()).collect(java.util.stream.Collectors.toSet()),
            profileImage == null ? null : imageAssetMapper.toResponse(profileImage),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}
