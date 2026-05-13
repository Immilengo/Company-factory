package com.company.core.modules.roles.entity;

import com.company.core.modules.common.entity.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "roles")
public class Role extends AuditableEntity {

    @Column(nullable = false, unique = true)
    private String name;
}
