package com.fincontrol.dashboard;

import com.fincontrol.categories.CategoryRepository;
import com.fincontrol.dashboard.dto.DashboardResponse;
import com.fincontrol.transactions.TransactionRepository;
import com.fincontrol.transactions.TransactionType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Test
    void dashboard_shouldComputeBalanceAndSavingsRate() {
        DashboardService service = new DashboardService(transactionRepository, categoryRepository);
        UUID userId = UUID.randomUUID();
        YearMonth month = YearMonth.of(2026, 8);

        when(transactionRepository.sumByTypeAndPeriod(eq(userId), eq(TransactionType.INCOME), any(), any()))
                .thenReturn(new BigDecimal("5000.00"));
        when(transactionRepository.sumByTypeAndPeriod(eq(userId), eq(TransactionType.EXPENSE), any(), any()))
                .thenReturn(new BigDecimal("3240.00"));
        when(transactionRepository.sumExpensesByCategory(eq(userId), any(), any())).thenReturn(List.of());
        when(transactionRepository.findTop5ByUserIdAndDeletedAtIsNullOrderByOccurredOnDescCreatedAtDesc(userId))
                .thenReturn(List.of());
        when(categoryRepository.findByUserIdOrderByGroupNameAscNameAsc(userId)).thenReturn(List.of());

        DashboardResponse response = service.getMonthlyDashboard(userId, month);

        assertThat(response.totalIncome()).isEqualByComparingTo("5000.00");
        assertThat(response.totalExpense()).isEqualByComparingTo("3240.00");
        assertThat(response.balance()).isEqualByComparingTo("1760.00");
        // (1760 / 5000) * 100 = 35.2%
        assertThat(response.savingsRate()).isEqualByComparingTo("35.2");
    }

    @Test
    void dashboard_shouldReturnZeroSavingsRate_whenNoIncome() {
        DashboardService service = new DashboardService(transactionRepository, categoryRepository);
        UUID userId = UUID.randomUUID();
        YearMonth month = YearMonth.of(2026, 8);

        when(transactionRepository.sumByTypeAndPeriod(eq(userId), eq(TransactionType.INCOME), any(), any()))
                .thenReturn(BigDecimal.ZERO);
        when(transactionRepository.sumByTypeAndPeriod(eq(userId), eq(TransactionType.EXPENSE), any(), any()))
                .thenReturn(new BigDecimal("100.00"));
        when(transactionRepository.sumExpensesByCategory(eq(userId), any(), any())).thenReturn(List.of());
        when(transactionRepository.findTop5ByUserIdAndDeletedAtIsNullOrderByOccurredOnDescCreatedAtDesc(userId))
                .thenReturn(List.of());
        when(categoryRepository.findByUserIdOrderByGroupNameAscNameAsc(userId)).thenReturn(List.of());

        DashboardResponse response = service.getMonthlyDashboard(userId, month);

        assertThat(response.savingsRate()).isEqualByComparingTo("0");
    }
}
