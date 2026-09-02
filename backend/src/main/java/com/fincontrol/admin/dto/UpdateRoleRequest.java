package com.fincontrol.admin.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(
        @NotNull(message = "Informe a nova role.")
        com.fincontrol.users.Role role
) {
}
