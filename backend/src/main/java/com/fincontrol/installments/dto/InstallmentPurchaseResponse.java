package com.fincontrol.installments.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record InstallmentPurchaseResponse(
        UUID id,
        String description,
        BigDecimal totalAmount,
        int installmentsCount,
        BigDecimal installmentAmount,
        LocalDate purchaseDate,
        UUID creditCardId,
        String creditCardName,
        List<InstallmentItem> installments
) {
    public record InstallmentItem(int number, BigDecimal amount, LocalDate dueOn) {}
}
