package com.company.core.modules.users.entity;

import com.company.core.modules.common.entity.BaseEntity;
import com.company.core.modules.roles.entity.Role;
import com.company.core.modules.statuses.entity.StatusEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.time.OffsetDateTime;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "status_id", nullable = false)
    private StatusEntity status;

    @Column(name = "status")
    private String legacyStatus;

    @Column(nullable = false)
    private Boolean emailVerified = false;

    @Column(length = 512)
    private String emailVerificationToken;

    private OffsetDateTime emailVerificationExpiresAt;

    @Column(length = 512)
    private String passwordResetToken;

    private OffsetDateTime passwordResetExpiresAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @PrePersist
    @PreUpdate
    void syncLegacyStatusColumn() {
        if (status != null && status.getCode() != null && !status.getCode().isBlank()) {
            this.legacyStatus = status.getCode();
        } else if (legacyStatus == null || legacyStatus.isBlank()) {
            this.legacyStatus = "PENDING";
        }
    }
}
