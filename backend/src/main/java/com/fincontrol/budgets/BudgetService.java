package com.fincontrol.budgets;

import com.fincontrol.budgets.dto.BudgetRequest;
import com.fincontrol.budgets.dto.BudgetResponse;
import com.fincontrol.categories.Category;
import com.fincontrol.categories.CategoryRepository;
import com.fincontrol.common.BusinessException;
import com.fincontrol.common.ResourceNotFoundException;
import com.fincontrol.transactions.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public BudgetService(BudgetRepository budgetRepository, CategoryRepository categoryRepository, TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<BudgetResponse> listForUser(UUID userId) {
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        if (budgets.isEmpty()) {
            return List.of();
        }

        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate monthEnd = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());

        Map<UUID, BigDecimal> spentByCategory = transactionRepository.sumExpensesByCategory(userId, monthStart, monthEnd)
                .stream()
                .collect(Collectors.toMap(
                        TransactionRepository.CategoryTotalProjection::getCategoryId,
                        TransactionRepository.CategoryTotalProjection::getTotal
                ));

        Map<UUID, Category> categoriesById = categoryRepository.findByUserIdOrderByGroupNameAscNameAsc(userId)
                .stream().collect(Collectors.toMap(Category::getId, c -> c));

        return budgets.stream()
                .map(b -> toResponse(b, categoriesById.get(b.getCategoryId()), spentByCategory.getOrDefault(b.getCategoryId(), BigDecimal.ZERO)))
                .toList();
    }

    @Transactional
    public BudgetResponse create(UUID userId, BudgetRequest request) {
        categoryRepository.findByIdAndUserId(request.categoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));

        if (budgetRepository.existsByUserIdAndCategoryId(userId, request.categoryId())) {
            throw new BusinessException("Já existe um orçamento para essa categoria.");
        }

        Budget budget = new Budget();
        budget.setUserId(userId);
        budget.setCategoryId(request.categoryId());
        budget.setAmount(request.amount());
        budgetRepository.save(budget);

        return listForUser(userId).stream()
                .filter(b -> b.id().equals(budget.getId()))
                .findFirst()
                .orElseThrow();
    }

    @Transactional
    public BudgetResponse update(UUID id, UUID userId, BudgetRequest request) {
        Budget budget = getOwned(id, userId);
        budget.setAmount(request.amount());
        budgetRepository.save(budget);

        return listForUser(userId).stream()
                .filter(b -> b.id().equals(budget.getId()))
                .findFirst()
                .orElseThrow();
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Budget budget = getOwned(id, userId);
        budgetRepository.delete(budget);
    }

    private Budget getOwned(UUID id, UUID userId) {
        return budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Orçamento não encontrado."));
    }

    private BudgetResponse toResponse(Budget budget, Category category, BigDecimal spent) {
        BigDecimal available = budget.getAmount().subtract(spent);
        BigDecimal percentUsed = budget.getAmount().compareTo(BigDecimal.ZERO) > 0
                ? spent.divide(budget.getAmount(), 4, RoundingMode.HALF_EVEN).multiply(BigDecimal.valueOf(100)).setScale(1, RoundingMode.HALF_EVEN)
                : BigDecimal.ZERO;

        String status;
        double pct = percentUsed.doubleValue();
        if (pct > 100) status = "exceeded";
        else if (pct >= 90) status = "near_limit";
        else if (pct >= 70) status = "attention";
        else status = "ok";

        return new BudgetResponse(
                budget.getId(),
                budget.getCategoryId(),
                category != null ? category.getName() : "Categoria removida",
                category != null ? category.getIcon() : "📦",
                category != null ? category.getColor() : "#6B7280",
                budget.getAmount(),
                spent,
                available,
                percentUsed,
                status
        );
    }
}
