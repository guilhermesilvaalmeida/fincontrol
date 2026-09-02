package com.fincontrol.admin.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminUserDetailResponse(
        UUID id,
        String name,
        String email,
        String avatar,
        String role,
        boolean active,
        Instant createdAt,
        long transactionsCount,
        long accountsCount,
        long creditCardsCount,
        long goalsCount,
        long budgetsCount
) {
}
