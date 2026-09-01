package com.fincontrol.goals.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record GoalResponse(
        UUID id,
        String name,
        String description,
        BigDecimal targetAmount,
        BigDecimal currentAmount,
        BigDecimal remainingAmount,
        BigDecimal percentComplete,
        LocalDate targetDate,
        BigDecimal monthlyAmountNeeded, // null se não houver prazo ou já atingida
        boolean completed
) {
}
