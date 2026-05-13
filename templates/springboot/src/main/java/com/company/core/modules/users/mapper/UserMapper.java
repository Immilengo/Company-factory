package com.company.core.modules.users.mapper;

import com.company.core.modules.users.dto.UserResponse;
import com.company.core.modules.users.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roles", expression = "java(user.getRoles().stream().map(r -> r.getName()).collect(java.util.stream.Collectors.toSet()))")
    @Mapping(target = "status", expression = "java(user.getStatus() != null ? user.getStatus().getCode() : null)")
    @Mapping(target = "profileImage", expression = "java(null)")
    UserResponse toResponse(User user);
}
