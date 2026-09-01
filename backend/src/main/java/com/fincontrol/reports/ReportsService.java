package com.fincontrol.reports;

import com.fincontrol.categories.Category;
import com.fincontrol.categories.CategoryRepository;
import com.fincontrol.reports.dto.ReportsResponse;
import com.fincontrol.transactions.Transaction;
import com.fincontrol.transactions.TransactionRepository;
import com.fincontrol.transactions.TransactionType;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ReportsService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public ReportsService(TransactionRepository transactionRepository, CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    public ReportsResponse build(UUID userId) {
        YearMonth currentMonth = YearMonth.now();
        YearMonth previousMonth = currentMonth.minusMonths(1);

        List<ReportsResponse.MonthlyPoint> evolution = buildMonthlyEvolution(userId, currentMonth);
        List<ReportsResponse.CategoryComparison> categoryComparison = buildCategoryComparison(userId, currentMonth, previousMonth);
        List<ReportsResponse.TopExpense> topExpenses = buildTopExpenses(userId, currentMonth);

        BigDecimal currentIncome = scale(transactionRepository.sumByTypeAndPeriod(userId, TransactionType.INCOME, currentMonth.atDay(1), currentMonth.atEndOfMonth()));
        BigDecimal currentExpense = scale(transactionRepository.sumByTypeAndPeriod(userId, TransactionType.EXPENSE, currentMonth.atDay(1), currentMonth.atEndOfMonth()));
        BigDecimal savingsRate = currentIncome.compareTo(BigDecimal.ZERO) > 0
                ? currentIncome.subtract(currentExpense).divide(currentIncome, 4, RoundingMode.HALF_EVEN).multiply(BigDecimal.valueOf(100)).setScale(1, RoundingMode.HALF_EVEN)
                : BigDecimal.ZERO;

        return new ReportsResponse(evolution, categoryComparison, topExpenses, currentIncome, currentExpense, savingsRate);
    }

    private List<ReportsResponse.MonthlyPoint> buildMonthlyEvolution(UUID userId, YearMonth currentMonth) {
        List<ReportsResponse.MonthlyPoint> points = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth month = currentMonth.minusMonths(i);
            BigDecimal income = scale(transactionRepository.sumByTypeAndPeriod(userId, TransactionType.INCOME, month.atDay(1), month.atEndOfMonth()));
            BigDecimal expense = scale(transactionRepository.sumByTypeAndPeriod(userId, TransactionType.EXPENSE, month.atDay(1), month.atEndOfMonth()));
            points.add(new ReportsResponse.MonthlyPoint(month, income, expense));
        }
        return points;
    }

    private List<ReportsResponse.CategoryComparison> buildCategoryComparison(UUID userId, YearMonth currentMonth, YearMonth previousMonth) {
        Map<UUID, BigDecimal> current = toMap(transactionRepository.sumExpensesByCategory(userId, currentMonth.atDay(1), currentMonth.atEndOfMonth()));
        Map<UUID, BigDecimal> previous = toMap(transactionRepository.sumExpensesByCategory(userId, previousMonth.atDay(1), previousMonth.atEndOfMonth()));

        Map<UUID, Category> categoriesById = new LinkedHashMap<>();
        categoryRepository.findByUserIdOrderByGroupNameAscNameAsc(userId).forEach(c -> categoriesById.put(c.getId(), c));

        java.util.Set<UUID> allCategoryIds = new java.util.LinkedHashSet<>();
        allCategoryIds.addAll(current.keySet());
        allCategoryIds.addAll(previous.keySet());

        List<ReportsResponse.CategoryComparison> result = new ArrayList<>();
        for (UUID categoryId : allCategoryIds) {
            BigDecimal currentAmount = current.getOrDefault(categoryId, BigDecimal.ZERO);
            BigDecimal previousAmount = previous.getOrDefault(categoryId, BigDecimal.ZERO);
            Category category = categoriesById.get(categoryId);

            BigDecimal percentChange;
            if (previousAmount.compareTo(BigDecimal.ZERO) > 0) {
                percentChange = currentAmount.subtract(previousAmount)
                        .divide(previousAmount, 4, RoundingMode.HALF_EVEN)
                        .multiply(BigDecimal.valueOf(100)).setScale(1, RoundingMode.HALF_EVEN);
            } else if (currentAmount.compareTo(BigDecimal.ZERO) > 0) {
                percentChange = BigDecimal.valueOf(100); // categoria nova este mês
            } else {
                percentChange = BigDecimal.ZERO;
            }

            result.add(new ReportsResponse.CategoryComparison(
                    categoryId,
                    category != null ? category.getName() : "Outros",
                    category != null ? category.getIcon() : "📦",
                    currentAmount,
                    previousAmount,
                    percentChange
            ));
        }

        result.sort((a, b) -> b.currentAmount().compareTo(a.currentAmount()));
        return result;
    }

    private List<ReportsResponse.TopExpense> buildTopExpenses(UUID userId, YearMonth currentMonth) {
        List<Transaction> top = transactionRepository.findByUserIdAndTypeAndDeletedAtIsNullAndOccurredOnBetweenOrderByAmountDesc(
                userId, TransactionType.EXPENSE, currentMonth.atDay(1), currentMonth.atEndOfMonth(), PageRequest.of(0, 5)
        );

        Map<UUID, Category> categoriesById = new LinkedHashMap<>();
        categoryRepository.findByUserIdOrderByGroupNameAscNameAsc(userId).forEach(c -> categoriesById.put(c.getId(), c));

        return top.stream().map(t -> {
            Category category = categoriesById.get(t.getCategoryId());
            return new ReportsResponse.TopExpense(
                    t.getId(), t.getDescription(), t.getAmount(), t.getOccurredOn(),
                    category != null ? category.getName() : "Outros",
                    category != null ? category.getIcon() : "📦"
            );
        }).toList();
    }

    private Map<UUID, BigDecimal> toMap(List<TransactionRepository.CategoryTotalProjection> projections) {
        Map<UUID, BigDecimal> map = new LinkedHashMap<>();
        projections.forEach(p -> map.put(p.getCategoryId(), p.getTotal()));
        return map;
    }

    private BigDecimal scale(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value).setScale(2, RoundingMode.HALF_EVEN);
    }
}
