package com.fincontrol.admin.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminUserResponse(
        UUID id,
        String name,
        String email,
        String avatar,
        String role,
        boolean active,
        Instant createdAt
) {
}
