package com.company.core.modules.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record UserRequest(
    @NotBlank String fullName,
    @NotBlank @Email String email,
    @NotBlank String password,
    String phone,
    UUID statusId
) {
}
