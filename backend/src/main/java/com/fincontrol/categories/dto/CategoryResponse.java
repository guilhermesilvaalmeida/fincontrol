package com.fincontrol.categories.dto;

import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        String groupName,
        String icon,
        String color,
        boolean isDefault
) {
}
