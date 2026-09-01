package com.fincontrol.creditcards.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreditCardRequest(
        @NotBlank(message = "Informe o nome do cartão.")
        String name,

        String bank,

        @NotNull(message = "Informe o limite do cartão.")
        BigDecimal creditLimit,

        @NotNull(message = "Informe o dia de fechamento.")
        @Min(value = 1, message = "O dia de fechamento deve ser entre 1 e 28.")
        @Max(value = 28, message = "O dia de fechamento deve ser entre 1 e 28.")
        Integer closingDay,

        @NotNull(message = "Informe o dia de vencimento.")
        @Min(value = 1, message = "O dia de vencimento deve ser entre 1 e 28.")
        @Max(value = 28, message = "O dia de vencimento deve ser entre 1 e 28.")
        Integer dueDay
) {
}
