package com.company.core.modules.auth.repository;

import com.company.core.modules.auth.entity.RefreshToken;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenAndDeletedFalse(String token);
    List<RefreshToken> findByUserIdAndRevokedFalseAndDeletedFalse(UUID userId);
}
