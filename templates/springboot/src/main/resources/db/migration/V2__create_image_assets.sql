CREATE TABLE image_assets (
    id UUID PRIMARY KEY,
    owner_type VARCHAR(50) NOT NULL,
    owner_id UUID NOT NULL,
    url VARCHAR(2048) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    primary_image BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_image_assets_owner ON image_assets(owner_type, owner_id);
CREATE INDEX idx_image_assets_owner_primary ON image_assets(owner_type, owner_id, primary_image);
