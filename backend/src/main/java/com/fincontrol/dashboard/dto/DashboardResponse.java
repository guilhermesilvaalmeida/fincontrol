package com.fincontrol.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record DashboardResponse(
        LocalDate periodStart,
        LocalDate periodEnd,
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal balance,
        BigDecimal savingsRate, // percentual, ex: 35.2
        List<CategoryBreakdown> expensesByCategory,
        List<RecentTransaction> recentTransactions
) {
    public record CategoryBreakdown(UUID categoryId, String name, String icon, String color, BigDecimal total) {}

    public record RecentTransaction(
            UUID id,
            String type,
            BigDecimal amount,
            String description,
            String categoryIcon,
            LocalDate occurredOn
    ) {}
}
