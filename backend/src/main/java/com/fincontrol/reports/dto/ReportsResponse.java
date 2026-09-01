package com.fincontrol.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

public record ReportsResponse(
        List<MonthlyPoint> monthlyEvolution,
        List<CategoryComparison> categoryComparison,
        List<TopExpense> topExpenses,
        BigDecimal currentMonthIncome,
        BigDecimal currentMonthExpense,
        BigDecimal currentMonthSavingsRate
) {
    public record MonthlyPoint(YearMonth month, BigDecimal income, BigDecimal expense) {}

    public record CategoryComparison(
            UUID categoryId, String name, String icon,
            BigDecimal currentAmount, BigDecimal previousAmount, BigDecimal percentChange
    ) {}

    public record TopExpense(UUID id, String description, BigDecimal amount, LocalDate occurredOn, String categoryName, String categoryIcon) {}
}
