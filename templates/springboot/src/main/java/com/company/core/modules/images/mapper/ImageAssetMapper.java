package com.company.core.modules.images.mapper;

import com.company.core.modules.images.dto.ImageResponse;
import com.company.core.modules.images.entity.ImageAsset;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ImageAssetMapper {
    ImageResponse toResponse(ImageAsset imageAsset);
}
