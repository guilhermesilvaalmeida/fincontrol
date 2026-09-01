package com.fincontrol.creditcards.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CreditCardResponse(
        UUID id,
        String name,
        String bank,
        BigDecimal creditLimit,
        int closingDay,
        int dueDay,
        BigDecimal committedAmount,   // soma das parcelas futuras (compromisso já assumido)
        BigDecimal availableLimit
) {
}
