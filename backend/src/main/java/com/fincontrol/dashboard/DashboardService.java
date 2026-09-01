package com.fincontrol.dashboard;

import com.fincontrol.categories.Category;
import com.fincontrol.categories.CategoryRepository;
import com.fincontrol.dashboard.dto.DashboardResponse;
import com.fincontrol.transactions.Transaction;
import com.fincontrol.transactions.TransactionRepository;
import com.fincontrol.transactions.TransactionType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public DashboardService(TransactionRepository transactionRepository, CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    public DashboardResponse getMonthlyDashboard(UUID userId, YearMonth month) {
        return getDashboard(userId, DashboardPeriod.MONTH, month.atDay(1));
    }

    public DashboardResponse getDashboard(UUID userId, DashboardPeriod period, LocalDate anchorDate) {
        LocalDate date = anchorDate != null ? anchorDate : LocalDate.now();
        LocalDate periodStart = switch (period) {
            case DAY -> date;
            case WEEK -> date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            case MONTH -> date.withDayOfMonth(1);
            case YEAR -> date.withDayOfYear(1);
        };
        LocalDate periodEnd = switch (period) {
            case DAY -> date;
            case WEEK -> periodStart.plusDays(6);
            case MONTH -> date.withDayOfMonth(date.lengthOfMonth());
            case YEAR -> date.withDayOfYear(date.lengthOfYear());
        };

        BigDecimal totalIncome = scale(transactionRepository.sumByTypeAndPeriod(userId, TransactionType.INCOME, periodStart, periodEnd));
        BigDecimal totalExpense = scale(transactionRepository.sumByTypeAndPeriod(userId, TransactionType.EXPENSE, periodStart, periodEnd));
        BigDecimal balance = totalIncome.subtract(totalExpense);
        BigDecimal savingsRate = calculateSavingsRate(totalIncome, balance);

        List<DashboardResponse.CategoryBreakdown> expensesByCategory = buildExpenseBreakdown(userId, periodStart, periodEnd);
        List<DashboardResponse.RecentTransaction> recentTransactions = buildRecentTransactions(userId);

        return new DashboardResponse(
                periodStart,
                periodEnd,
                totalIncome,
                totalExpense,
                balance,
                savingsRate,
                expensesByCategory,
                recentTransactions
        );
    }

    private BigDecimal calculateSavingsRate(BigDecimal totalIncome, BigDecimal balance) {
        if (totalIncome.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return balance
                .divide(totalIncome, 4, RoundingMode.HALF_EVEN)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_EVEN);
    }

    private List<DashboardResponse.CategoryBreakdown> buildExpenseBreakdown(UUID userId, LocalDate from, LocalDate to) {
        List<TransactionRepository.CategoryTotalProjection> totals = transactionRepository.sumExpensesByCategory(userId, from, to);

        Map<UUID, Category> categoriesById = categoryRepository.findByUserIdOrderByGroupNameAscNameAsc(userId).stream()
                .collect(java.util.stream.Collectors.toMap(Category::getId, c -> c));

        return totals.stream()
                .map(t -> {
                    Category category = categoriesById.get(t.getCategoryId());
                    return new DashboardResponse.CategoryBreakdown(
                            t.getCategoryId(),
                            category != null ? category.getName() : "Outros",
                            category != null ? category.getIcon() : "📦",
                            category != null ? category.getColor() : "#6B7280",
                            scale(t.getTotal())
                    );
                })
                .sorted((a, b) -> b.total().compareTo(a.total()))
                .toList();
    }

    private List<DashboardResponse.RecentTransaction> buildRecentTransactions(UUID userId) {
        List<Transaction> recent = transactionRepository.findTop5ByUserIdAndDeletedAtIsNullOrderByOccurredOnDescCreatedAtDesc(userId);

        Map<UUID, Category> categoriesById = categoryRepository.findByUserIdOrderByGroupNameAscNameAsc(userId).stream()
                .collect(java.util.stream.Collectors.toMap(Category::getId, c -> c));

        return recent.stream()
                .map(t -> new DashboardResponse.RecentTransaction(
                        t.getId(),
                        t.getType().name(),
                        scale(t.getAmount()),
                        t.getDescription(),
                        categoriesById.containsKey(t.getCategoryId()) ? categoriesById.get(t.getCategoryId()).getIcon() : "📦",
                        t.getOccurredOn()
                ))
                .toList();
    }

    private BigDecimal scale(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value).setScale(2, RoundingMode.HALF_EVEN);
    }
}
