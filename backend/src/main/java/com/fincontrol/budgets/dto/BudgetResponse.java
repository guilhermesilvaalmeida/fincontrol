package com.fincontrol.budgets.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record BudgetResponse(
        UUID id,
        UUID categoryId,
        String categoryName,
        String categoryIcon,
        String categoryColor,
        BigDecimal amount,
        BigDecimal spent,
        BigDecimal available,
        BigDecimal percentUsed,
        String status // ok | attention | near_limit | exceeded
) {
}
