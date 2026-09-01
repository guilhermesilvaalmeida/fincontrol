package com.fincontrol.installments.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record InstallmentPurchaseRequest(
        @NotBlank(message = "Informe uma descrição para a compra.")
        String description,

        @NotNull(message = "Informe o valor total.")
        @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero.")
        BigDecimal totalAmount,

        @NotNull(message = "Informe o número de parcelas.")
        @Min(value = 1, message = "Mínimo de 1 parcela.")
        @Max(value = 60, message = "Máximo de 60 parcelas.")
        Integer installmentsCount,

        @NotNull(message = "Selecione o cartão.")
        UUID creditCardId,

        @NotNull(message = "Selecione uma categoria.")
        UUID categoryId,

        @NotNull(message = "Informe a data da compra.")
        LocalDate purchaseDate
) {
}
