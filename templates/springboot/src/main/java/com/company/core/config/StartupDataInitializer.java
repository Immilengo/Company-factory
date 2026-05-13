package com.company.core.config;

import com.company.core.modules.roles.entity.Role;
import com.company.core.modules.roles.repository.RoleRepository;
import com.company.core.modules.statuses.service.StatusService;
import com.company.core.modules.users.entity.User;
import com.company.core.modules.users.repository.UserRepository;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@Configuration
public class StartupDataInitializer {

    @Bean
    ApplicationRunner createDefaultAdmin(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, StatusService statusService) {
        return args -> {
            Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> {
                Role role = new Role();
                role.setId(UUID.randomUUID());
                role.setName("ADMIN");
                return roleRepository.save(role);
            });

            userRepository.findByEmailAndDeletedFalse("admin@company.com").orElseGet(() -> {
                User admin = new User();
                admin.setId(UUID.randomUUID());
                admin.setFullName("Default Admin");
                admin.setEmail("admin@company.com");
                admin.setPassword(passwordEncoder.encode("Admin123@"));
                admin.setEmailVerified(true);
                admin.setStatus(statusService.getByCode("ACTIVE"));
                admin.getRoles().add(adminRole);
                log.info("startup admin user created email={}", admin.getEmail());
                return userRepository.save(admin);
            });

            log.info("startup initialization completed");
        };
    }
}
