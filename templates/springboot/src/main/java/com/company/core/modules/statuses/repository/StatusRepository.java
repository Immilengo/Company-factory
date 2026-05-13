package com.company.core.modules.statuses.repository;

import com.company.core.modules.statuses.entity.StatusEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusRepository extends JpaRepository<StatusEntity, UUID> {
    Optional<StatusEntity> findByCodeAndDeletedFalse(String code);
    List<StatusEntity> findByDeletedFalse();
    List<StatusEntity> findByDeletedTrue();
}
