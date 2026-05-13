package com.company.core.modules.images.controller;

import com.company.core.modules.common.dto.ApiResponse;
import com.company.core.modules.common.enums.RecordStatusFilter;
import com.company.core.modules.images.dto.ImageCreateRequest;
import com.company.core.modules.images.dto.ImageResponse;
import com.company.core.modules.images.entity.ImageOwnerType;
import com.company.core.modules.images.mapper.ImageAssetMapper;
import com.company.core.modules.images.service.ImageAssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/images")
@Tag(name = "Images", description = "Modulo generico de imagens para USER, PRODUCT e futuras entidades")
public class ImageAssetController {

    private final ImageAssetService imageAssetService;
    private final ImageAssetMapper imageAssetMapper;

    public ImageAssetController(ImageAssetService imageAssetService, ImageAssetMapper imageAssetMapper) {
        this.imageAssetService = imageAssetService;
        this.imageAssetMapper = imageAssetMapper;
    }

    @PostMapping("/{ownerType}/{ownerId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Criar imagem para entidade", description = "Anexa uma imagem ao owner informado por ownerType + ownerId.")
    public ResponseEntity<ApiResponse<ImageResponse>> create(
        @Parameter(description = "Tipo do dono da imagem: USER, PRODUCT, GENERIC") @PathVariable ImageOwnerType ownerType,
        @Parameter(description = "ID da entidade dona da imagem") @PathVariable UUID ownerId,
        @Valid @RequestBody ImageCreateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.<ImageResponse>builder()
            .success(true)
            .message("Image created successfully")
            .data(imageAssetMapper.toResponse(imageAssetService.create(ownerType, ownerId, request)))
            .build());
    }

    @GetMapping("/{ownerType}/{ownerId}")
    @Operation(summary = "Listar imagens por entidade", description = "Retorna lista de imagens por entidade filtrando por status ACTIVE/INACTIVE/ALL.")
    public ResponseEntity<ApiResponse<List<ImageResponse>>> list(
        @PathVariable ImageOwnerType ownerType,
        @PathVariable UUID ownerId,
        @RequestParam(defaultValue = "ACTIVE") RecordStatusFilter recordStatus
    ) {
        return ResponseEntity.ok(ApiResponse.<List<ImageResponse>>builder()
            .success(true)
            .message("Images retrieved successfully")
            .data(imageAssetService.list(ownerType, ownerId, recordStatus).stream().map(imageAssetMapper::toResponse).toList())
            .build());
    }

    @PatchMapping("/{ownerType}/{ownerId}/{imageId}/primary")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Definir imagem principal", description = "Marca a imagem informada como principal da entidade e remove principal anterior.")
    public ResponseEntity<ApiResponse<Void>> setPrimary(@PathVariable ImageOwnerType ownerType, @PathVariable UUID ownerId, @PathVariable UUID imageId) {
        imageAssetService.setPrimary(ownerType, ownerId, imageId);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Primary image updated successfully").build());
    }

    @PatchMapping("/{imageId}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Atualizar status da imagem", description = "Ativa ou desativa uma imagem de forma logica.")
    public ResponseEntity<ApiResponse<ImageResponse>> patchStatus(@PathVariable UUID imageId, @RequestParam boolean active) {
        return ResponseEntity.ok(ApiResponse.<ImageResponse>builder().success(true).message("Image status updated successfully")
            .data(imageAssetMapper.toResponse(imageAssetService.patchStatus(imageId, active))).build());
    }

    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Remover imagem (soft delete)", description = "Marca imagem como deletada, sem apagar fisicamente do banco.")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID imageId) {
        imageAssetService.softDelete(imageId);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Image deleted successfully").build());
    }
}
