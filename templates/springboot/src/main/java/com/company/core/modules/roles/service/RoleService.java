package com.company.core.modules.roles.service;

import com.company.core.exceptions.NotFoundException;
import com.company.core.modules.common.enums.RecordStatusFilter;
import com.company.core.modules.roles.dto.RolePatchRequest;
import com.company.core.modules.roles.dto.RoleRequest;
import com.company.core.modules.roles.entity.Role;
import com.company.core.modules.roles.repository.RoleRepository;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;

@Service
public class RoleService {
    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public Role create(RoleRequest request) {
        Role role = new Role();
        role.setId(UUID.randomUUID());
        role.setName(request.name().toUpperCase(Locale.ROOT));
        return roleRepository.save(role);
    }

    public List<Role> list(RecordStatusFilter status) {
        return switch (status) {
            case ACTIVE -> roleRepository.findByDeletedFalse();
            case INACTIVE -> roleRepository.findByDeletedTrue();
            case ALL -> roleRepository.findAll();
        };
    }

    public Role get(UUID id) {
        return roleRepository.findById(id).orElseThrow(() -> new NotFoundException("Role not found"));
    }

    public Role update(UUID id, RoleRequest request) {
        Role role = get(id);
        role.setName(request.name().toUpperCase(Locale.ROOT));
        return roleRepository.save(role);
    }

    public Role patch(UUID id, RolePatchRequest request) {
        Role role = get(id);
        if (request.name() != null && !request.name().isBlank()) {
            role.setName(request.name().toUpperCase(Locale.ROOT));
        }
        if (request.active() != null) {
            role.setDeleted(!request.active());
        }
        return roleRepository.save(role);
    }

    public void softDelete(UUID id) {
        Role role = get(id);
        role.setDeleted(true);
        roleRepository.save(role);
    }

    @Configuration
    static class RoleSeeder {
        @Bean
        ApplicationRunner seedRoles(RoleRepository roleRepository) {
            return args -> List.of("ADMIN", "USER", "MANAGER").forEach(name -> roleRepository.findByName(name).orElseGet(() -> {
                Role role = new Role();
                role.setId(UUID.randomUUID());
                role.setName(name);
                return roleRepository.save(role);
            }));
        }
    }
}
