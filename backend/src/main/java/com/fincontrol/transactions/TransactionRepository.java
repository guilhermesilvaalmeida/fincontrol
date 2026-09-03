package com.fincontrol.transactions;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID>, JpaSpecificationExecutor<Transaction> {

    long countByUserIdAndDeletedAtIsNull(UUID userId);

    Optional<Transaction> findByIdAndUserId(UUID id, UUID userId);

        boolean existsByCreditCardIdAndUserIdAndDeletedAtIsNull(UUID creditCardId, UUID userId);

    @Query("""
            SELECT COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount ELSE -t.amount END), 0)
            FROM Transaction t
            WHERE t.accountId = :accountId AND t.userId = :userId AND t.deletedAt IS NULL
            """)
    BigDecimal sumNetAmountByAccount(@Param("accountId") UUID accountId, @Param("userId") UUID userId);

    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.userId = :userId AND t.type = :type
              AND t.occurredOn BETWEEN :from AND :to AND t.deletedAt IS NULL
            """)
    BigDecimal sumByTypeAndPeriod(
            @Param("userId") UUID userId,
            @Param("type") TransactionType type,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
            SELECT t.categoryId AS categoryId, COALESCE(SUM(t.amount), 0) AS total
            FROM Transaction t
            WHERE t.userId = :userId AND t.type = 'EXPENSE'
              AND t.occurredOn BETWEEN :from AND :to AND t.deletedAt IS NULL
            GROUP BY t.categoryId
            """)
    List<CategoryTotalProjection> sumExpensesByCategory(
            @Param("userId") UUID userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    List<Transaction> findTop5ByUserIdAndDeletedAtIsNullOrderByOccurredOnDescCreatedAtDesc(UUID userId);

    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.creditCardId = :creditCardId AND t.userId = :userId
              AND t.occurredOn >= :fromDate AND t.deletedAt IS NULL
            """)
    BigDecimal sumCommittedByCreditCard(
            @Param("creditCardId") UUID creditCardId,
            @Param("userId") UUID userId,
            @Param("fromDate") LocalDate fromDate
    );

    List<Transaction> findByInstallmentPurchaseIdOrderByInstallmentNumberAsc(UUID installmentPurchaseId);

    List<Transaction> findByUserIdAndTypeAndDeletedAtIsNullAndOccurredOnBetweenOrderByAmountDesc(
            UUID userId, TransactionType type, LocalDate from, LocalDate to, org.springframework.data.domain.Pageable pageable
    );

    interface CategoryTotalProjection {
        UUID getCategoryId();
        BigDecimal getTotal();
    }
}
