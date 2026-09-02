package com.fincontrol.admin.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(
        @NotNull(message = "Informe o novo status.")
        Boolean active
) {
}
