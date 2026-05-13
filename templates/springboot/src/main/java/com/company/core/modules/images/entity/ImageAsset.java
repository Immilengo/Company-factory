package com.company.core.modules.images.entity;

import com.company.core.modules.common.entity.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "image_assets")
public class ImageAsset extends AuditableEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ImageOwnerType ownerType;

    @Column(nullable = false)
    private UUID ownerId;

    @Column(nullable = false, length = 2048)
    private String url;

    @Column(nullable = false, length = 255)
    private String fileName;

    @Column(nullable = false, length = 100)
    private String contentType;

    @Column(nullable = false)
    private Long sizeBytes;

    @Column(nullable = false)
    private Boolean primaryImage = false;

    @Column(nullable = false)
    private Integer sortOrder = 0;
}
