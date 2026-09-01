package com.fincontrol.budgets.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record BudgetRequest(
        @NotNull(message = "Selecione uma categoria.")
        UUID categoryId,

        @NotNull(message = "Informe o valor do orçamento.")
        @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero.")
        BigDecimal amount
) {
}
