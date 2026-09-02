package com.fincontrol.admin.dto;

import com.fincontrol.users.Role;

public record AdminUserFilter(
        String query,
        Role role,
        Boolean active
) {
}
