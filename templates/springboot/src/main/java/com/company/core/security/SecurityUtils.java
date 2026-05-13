package com.company.core.security;

import com.company.core.exceptions.BusinessException;
import com.company.core.modules.users.entity.User;
import com.company.core.modules.users.repository.UserRepository;
import java.util.Set;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("securityUtils")
public class SecurityUtils {

    private final UserRepository userRepository;

    public SecurityUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UUID getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new BusinessException("Unauthenticated request");
        }
        return userRepository.findByEmailAndDeletedFalse(authentication.getName())
            .orElseThrow(() -> new BusinessException("Authenticated user not found"));
    }

    public User getCurretUser() {
        return getCurrentUser();
    }

    public String getCurrentUserStatus() {
        return getCurrentUser().getStatus().getCode();
    }

    public Set<String> getCurrentUserRole() {
        return getCurrentUser().getRoles().stream().map(role -> role.getName()).collect(java.util.stream.Collectors.toSet());
    }

    public boolean isCurrentUser(UUID userId) {
        return getCurrentUserId().equals(userId);
    }

    public boolean hasRole(String roleName) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(authority -> authority.equals("ROLE_" + roleName));
    }
}
