package com.fincontrol.transactions.dto;

import com.fincontrol.transactions.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionRequest(
        @NotNull(message = "Informe o tipo (receita ou despesa).")
        TransactionType type,

        @NotNull(message = "Informe o valor.")
        @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero.")
        BigDecimal amount,

        @NotBlank(message = "Informe uma descrição.")
        String description,

        @NotNull(message = "Selecione uma categoria.")
        UUID categoryId,

        @NotNull(message = "Selecione uma conta.")
        UUID accountId,

        String paymentMethod,

        @NotNull(message = "Informe a data.")
        LocalDate occurredOn,

        String notes
) {
}
