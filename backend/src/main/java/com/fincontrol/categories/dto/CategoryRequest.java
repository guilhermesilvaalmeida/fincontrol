package com.fincontrol.categories.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequest(
        @NotBlank(message = "Informe o nome da categoria.")
        String name,

        String groupName,
        String icon,
        String color
) {
}
