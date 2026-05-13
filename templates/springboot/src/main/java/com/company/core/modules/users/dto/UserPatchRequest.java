package com.company.core.modules.users.dto;

import jakarta.validation.constraints.Email;
import java.util.UUID;

public record UserPatchRequest(
    String fullName,
    @Email String email,
    String phone,
    UUID statusId,
    Boolean active
) {
}
