package com.fincontrol.goals.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GoalRequest(
        @NotBlank(message = "Informe o nome da meta.")
        String name,

        @NotNull(message = "Informe o valor da meta.")
        @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero.")
        BigDecimal targetAmount,

        @DecimalMin(value = "0.0", inclusive = true, message = "O valor inicial não pode ser negativo.")
        BigDecimal initialAmount,

        LocalDate targetDate,

        String description
) {
}
