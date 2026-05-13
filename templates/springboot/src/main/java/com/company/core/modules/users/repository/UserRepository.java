package com.company.core.modules.users.repository;

import com.company.core.modules.users.entity.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmailAndDeletedFalse(String email);
    Page<User> findByStatusIdAndDeletedFalse(UUID statusId, Pageable pageable);
    Page<User> findByStatusIdAndDeletedTrue(UUID statusId, Pageable pageable);
    Page<User> findByDeletedFalse(Pageable pageable);
    Page<User> findByDeletedTrue(Pageable pageable);
    Optional<User> findByEmailVerificationTokenAndDeletedFalse(String emailVerificationToken);
    Optional<User> findByPasswordResetTokenAndDeletedFalse(String passwordResetToken);
}
