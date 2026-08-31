package com.fincontrol.accounts.dto;

import com.fincontrol.accounts.AccountType;

import java.math.BigDecimal;
import java.util.UUID;

public record AccountResponse(
        UUID id,
        String name,
        AccountType type,
        String institution,
        BigDecimal initialBalance,
        BigDecimal currentBalance
) {
}
