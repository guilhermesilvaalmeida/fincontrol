package com.fincontrol.goals.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record GoalAmountRequest(
        @NotNull(message = "Informe o valor guardado.")
        @DecimalMin(value = "0.0", inclusive = true, message = "O valor guardado não pode ser negativo.")
        BigDecimal amount
) {
}