package com.company.core.modules.users.service;

import com.company.core.exceptions.BusinessException;
import com.company.core.exceptions.NotFoundException;
import com.company.core.modules.common.enums.RecordStatusFilter;
import com.company.core.modules.roles.entity.Role;
import com.company.core.modules.roles.repository.RoleRepository;
import com.company.core.modules.statuses.entity.StatusEntity;
import com.company.core.modules.statuses.service.StatusService;
import com.company.core.modules.users.dto.UserPatchRequest;
import com.company.core.modules.users.dto.UserRequest;
import com.company.core.modules.users.entity.User;
import com.company.core.modules.users.repository.UserRepository;
import java.util.Locale;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final StatusService statusService;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, StatusService statusService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.statusService = statusService;
    }

    public User create(UserRequest request) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setFullName(request.fullName());
        user.setEmail(request.email().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhone(request.phone());

        StatusEntity status = request.statusId() == null
            ? statusService.getByCode("PENDING")
            : statusService.get(request.statusId());
        user.setStatus(status);

        roleRepository.findByName("USER").ifPresent(role -> user.getRoles().add(role));
        return userRepository.save(user);
    }

    public Page<User> list(Pageable pageable, UUID statusId, RecordStatusFilter recordStatus) {
        if (statusId != null) {
            return switch (recordStatus) {
                case ACTIVE, ALL -> userRepository.findByStatusIdAndDeletedFalse(statusId, pageable);
                case INACTIVE -> userRepository.findByStatusIdAndDeletedTrue(statusId, pageable);
            };
        }
        return switch (recordStatus) {
            case ACTIVE, ALL -> userRepository.findByDeletedFalse(pageable);
            case INACTIVE -> userRepository.findByDeletedTrue(pageable);
        };
    }

    public Page<User> list(int page, int size, String sortBy, String direction, UUID statusId, RecordStatusFilter recordStatus) {
        String normalizedSort = switch (sortBy) {
            case "fullName", "email", "createdAt", "updatedAt" -> sortBy;
            default -> "createdAt";
        };
        Sort sort = "asc".equalsIgnoreCase(direction)
            ? Sort.by(normalizedSort).ascending()
            : Sort.by(normalizedSort).descending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), sort);
        return list(pageable, statusId, recordStatus);
    }

    public User get(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
    }

    public User getByEmail(String email) {
        return userRepository.findByEmailAndDeletedFalse(email.toLowerCase()).orElseThrow(() -> new NotFoundException("User not found"));
    }

    public User patch(UUID id, UserPatchRequest request) {
        User user = get(id);
        if (request.fullName() != null) user.setFullName(request.fullName());
        if (request.email() != null) user.setEmail(request.email().toLowerCase());
        if (request.phone() != null) user.setPhone(request.phone());
        if (request.statusId() != null) user.setStatus(statusService.get(request.statusId()));
        if (request.active() != null) user.setDeleted(!request.active());
        return userRepository.save(user);
    }

    public User addRole(UUID userId, String roleName) {
        User user = get(userId);
        Role role = roleRepository.findByName(roleName.toUpperCase(Locale.ROOT))
            .orElseThrow(() -> new BusinessException("Role not found"));
        user.getRoles().add(role);
        return userRepository.save(user);
    }

    public void softDelete(UUID id) {
        User user = get(id);
        user.setDeleted(true);
        user.setStatus(statusService.getByCode("DELETED"));
        userRepository.save(user);
    }
}
