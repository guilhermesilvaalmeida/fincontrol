package com.fincontrol.transactions.dto;

import com.fincontrol.transactions.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionFilter(
        TransactionType type,
        UUID categoryId,
        UUID accountId,
        UUID creditCardId,
        LocalDate from,
        LocalDate to,
        BigDecimal minAmount,
        BigDecimal maxAmount,
        String query,
        String sort // recent | oldest | highest | lowest
) {
}
