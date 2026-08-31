package com.fincontrol.transactions;

import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public final class TransactionSpecifications {

    private TransactionSpecifications() {
    }

    public static Specification<Transaction> belongsToUser(UUID userId) {
        return (root, query, cb) -> cb.equal(root.get("userId"), userId);
    }

    public static Specification<Transaction> notDeleted() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    public static Specification<Transaction> hasType(TransactionType type) {
        return (root, query, cb) -> type == null ? null : cb.equal(root.get("type"), type);
    }

    public static Specification<Transaction> hasCategory(UUID categoryId) {
        return (root, query, cb) -> categoryId == null ? null : cb.equal(root.get("categoryId"), categoryId);
    }

    public static Specification<Transaction> hasAccount(UUID accountId) {
        return (root, query, cb) -> accountId == null ? null : cb.equal(root.get("accountId"), accountId);
    }

    public static Specification<Transaction> occurredFrom(LocalDate from) {
        return (root, query, cb) -> from == null ? null : cb.greaterThanOrEqualTo(root.get("occurredOn"), from);
    }

    public static Specification<Transaction> occurredTo(LocalDate to) {
        return (root, query, cb) -> to == null ? null : cb.lessThanOrEqualTo(root.get("occurredOn"), to);
    }

    public static Specification<Transaction> amountFrom(BigDecimal min) {
        return (root, query, cb) -> min == null ? null : cb.greaterThanOrEqualTo(root.get("amount"), min);
    }

    public static Specification<Transaction> amountTo(BigDecimal max) {
        return (root, query, cb) -> max == null ? null : cb.lessThanOrEqualTo(root.get("amount"), max);
    }

    public static Specification<Transaction> descriptionContains(String query) {
        return (root, cq, cb) -> {
            if (query == null || query.isBlank()) {
                return null;
            }
            return cb.like(cb.lower(root.get("description")), "%" + query.trim().toLowerCase() + "%");
        };
    }
}
