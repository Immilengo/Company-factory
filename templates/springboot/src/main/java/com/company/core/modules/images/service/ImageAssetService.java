package com.company.core.modules.images.service;

import com.company.core.exceptions.NotFoundException;
import com.company.core.modules.common.enums.RecordStatusFilter;
import com.company.core.modules.images.dto.ImageCreateRequest;
import com.company.core.modules.images.entity.ImageAsset;
import com.company.core.modules.images.entity.ImageOwnerType;
import com.company.core.modules.images.repository.ImageAssetRepository;
import com.company.core.modules.users.repository.UserRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ImageAssetService {

    private final ImageAssetRepository imageAssetRepository;
    private final UserRepository userRepository;

    public ImageAssetService(ImageAssetRepository imageAssetRepository, UserRepository userRepository) {
        this.imageAssetRepository = imageAssetRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ImageAsset create(ImageOwnerType ownerType, UUID ownerId, ImageCreateRequest request) {
        validateOwner(ownerType, ownerId);

        if (Boolean.TRUE.equals(request.primaryImage())) {
            unsetCurrentPrimary(ownerType, ownerId);
        }

        ImageAsset imageAsset = new ImageAsset();
        imageAsset.setId(UUID.randomUUID());
        imageAsset.setOwnerType(ownerType);
        imageAsset.setOwnerId(ownerId);
        imageAsset.setUrl(request.url());
        imageAsset.setFileName(request.fileName());
        imageAsset.setContentType(request.contentType());
        imageAsset.setSizeBytes(request.sizeBytes());
        imageAsset.setPrimaryImage(Boolean.TRUE.equals(request.primaryImage()));
        imageAsset.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());

        return imageAssetRepository.save(imageAsset);
    }

    public List<ImageAsset> list(ImageOwnerType ownerType, UUID ownerId, RecordStatusFilter recordStatus) {
        return switch (recordStatus) {
            case ACTIVE -> imageAssetRepository.findByOwnerTypeAndOwnerIdAndDeletedFalseOrderByPrimaryImageDescSortOrderAscCreatedAtAsc(ownerType, ownerId);
            case INACTIVE -> imageAssetRepository.findByOwnerTypeAndOwnerIdAndDeletedTrueOrderByPrimaryImageDescSortOrderAscCreatedAtAsc(ownerType, ownerId);
            case ALL -> imageAssetRepository.findByOwnerTypeAndOwnerIdOrderByPrimaryImageDescSortOrderAscCreatedAtAsc(ownerType, ownerId);
        };
    }

    public ImageAsset getPrimary(ImageOwnerType ownerType, UUID ownerId) {
        return imageAssetRepository.findByOwnerTypeAndOwnerIdAndPrimaryImageTrueAndDeletedFalse(ownerType, ownerId)
            .orElse(null);
    }

    @Transactional
    public void setPrimary(ImageOwnerType ownerType, UUID ownerId, UUID imageId) {
        validateOwner(ownerType, ownerId);
        unsetCurrentPrimary(ownerType, ownerId);
        ImageAsset image = imageAssetRepository.findById(imageId)
            .filter(found -> !found.getDeleted())
            .orElseThrow(() -> new NotFoundException("Image not found"));
        image.setPrimaryImage(true);
        imageAssetRepository.save(image);
    }

    @Transactional
    public ImageAsset patchStatus(UUID imageId, boolean active) {
        ImageAsset image = imageAssetRepository.findById(imageId)
            .orElseThrow(() -> new NotFoundException("Image not found"));
        image.setDeleted(!active);
        return imageAssetRepository.save(image);
    }

    @Transactional
    public void softDelete(UUID imageId) {
        ImageAsset image = imageAssetRepository.findById(imageId)
            .filter(found -> !found.getDeleted())
            .orElseThrow(() -> new NotFoundException("Image not found"));
        image.setDeleted(true);
        imageAssetRepository.save(image);
    }

    private void unsetCurrentPrimary(ImageOwnerType ownerType, UUID ownerId) {
        imageAssetRepository.findByOwnerTypeAndOwnerIdAndPrimaryImageTrueAndDeletedFalse(ownerType, ownerId).ifPresent(image -> {
            image.setPrimaryImage(false);
            imageAssetRepository.save(image);
        });
    }

    private void validateOwner(ImageOwnerType ownerType, UUID ownerId) {
        if (ownerType == ImageOwnerType.USER) {
            userRepository.findById(ownerId).filter(user -> !user.getDeleted())
                .orElseThrow(() -> new NotFoundException("Owner user not found"));
        }
    }
}
