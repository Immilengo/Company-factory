package com.company.core.modules.roles.repository;

import com.company.core.modules.roles.entity.Role;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(String name);
    List<Role> findByDeletedFalse();
    List<Role> findByDeletedTrue();
}
