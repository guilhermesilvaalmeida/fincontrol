package com.fincontrol.transactions.dto;

import com.fincontrol.transactions.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        TransactionType type,
        BigDecimal amount,
        String description,
        CategoryRef category,
        AccountRef account,
        CreditCardRef creditCard,
        Integer installmentNumber,
        Integer installmentTotal,
        String paymentMethod,
        LocalDate occurredOn,
        String notes
) {
    public record CategoryRef(UUID id, String name, String icon, String color) {}
    public record AccountRef(UUID id, String name) {}
    public record CreditCardRef(UUID id, String name) {}
}
