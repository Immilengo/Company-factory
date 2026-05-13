package com.company.core.modules.images.repository;

import com.company.core.modules.images.entity.ImageAsset;
import com.company.core.modules.images.entity.ImageOwnerType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageAssetRepository extends JpaRepository<ImageAsset, UUID> {

    List<ImageAsset> findByOwnerTypeAndOwnerIdAndDeletedFalseOrderByPrimaryImageDescSortOrderAscCreatedAtAsc(ImageOwnerType ownerType, UUID ownerId);
    List<ImageAsset> findByOwnerTypeAndOwnerIdAndDeletedTrueOrderByPrimaryImageDescSortOrderAscCreatedAtAsc(ImageOwnerType ownerType, UUID ownerId);
    List<ImageAsset> findByOwnerTypeAndOwnerIdOrderByPrimaryImageDescSortOrderAscCreatedAtAsc(ImageOwnerType ownerType, UUID ownerId);

    Optional<ImageAsset> findByOwnerTypeAndOwnerIdAndPrimaryImageTrueAndDeletedFalse(ImageOwnerType ownerType, UUID ownerId);
}
