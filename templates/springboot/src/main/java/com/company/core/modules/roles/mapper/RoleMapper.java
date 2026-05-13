package com.company.core.modules.roles.mapper;

import com.company.core.modules.roles.dto.RoleResponse;
import com.company.core.modules.roles.entity.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleResponse toResponse(Role role);
}
