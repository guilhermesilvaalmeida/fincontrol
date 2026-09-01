package com.fincontrol.goals;

import com.fincontrol.common.ResourceNotFoundException;
import com.fincontrol.goals.dto.GoalContributionRequest;
import com.fincontrol.goals.dto.GoalRequest;
import com.fincontrol.goals.dto.GoalResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.UUID;

@Service
public class GoalService {

    private final GoalRepository goalRepository;

    public GoalService(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    public List<GoalResponse> listForUser(UUID userId) {
        return goalRepository.findByUserIdOrderByTargetDateAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public GoalResponse create(UUID userId, GoalRequest request) {
        Goal goal = new Goal();
        goal.setUserId(userId);
        applyRequest(goal, request);
        if (request.initialAmount() != null) {
            goal.setCurrentAmount(request.initialAmount());
        }

        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public GoalResponse update(UUID id, UUID userId, GoalRequest request) {
        Goal goal = getOwned(id, userId);
        applyRequest(goal, request);

        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public GoalResponse contribute(UUID id, UUID userId, GoalContributionRequest request) {
        Goal goal = getOwned(id, userId);
        goal.setCurrentAmount(goal.getCurrentAmount().add(request.amount()));

        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Goal goal = getOwned(id, userId);
        goalRepository.delete(goal);
    }

    private void applyRequest(Goal goal, GoalRequest request) {
        goal.setName(request.name().trim());
        goal.setTargetAmount(request.targetAmount());
        goal.setTargetDate(request.targetDate());
        goal.setDescription(request.description());
    }

    private Goal getOwned(UUID id, UUID userId) {
        return goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada."));
    }

    private GoalResponse toResponse(Goal goal) {
        BigDecimal remaining = goal.getTargetAmount().subtract(goal.getCurrentAmount()).max(BigDecimal.ZERO);
        boolean completed = goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0;

        BigDecimal percent = goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                ? goal.getCurrentAmount().divide(goal.getTargetAmount(), 4, RoundingMode.HALF_EVEN)
                        .multiply(BigDecimal.valueOf(100)).min(BigDecimal.valueOf(100)).setScale(1, RoundingMode.HALF_EVEN)
                : BigDecimal.ZERO;

        BigDecimal monthlyNeeded = null;
        if (!completed && goal.getTargetDate() != null && goal.getTargetDate().isAfter(LocalDate.now())) {
            int monthsLeft = Math.max(1, Period.between(LocalDate.now().withDayOfMonth(1), goal.getTargetDate().withDayOfMonth(1)).toTotalMonths() == 0
                    ? 1
                    : (int) Period.between(LocalDate.now().withDayOfMonth(1), goal.getTargetDate().withDayOfMonth(1)).toTotalMonths());
            monthlyNeeded = remaining.divide(BigDecimal.valueOf(monthsLeft), 2, RoundingMode.HALF_EVEN);
        }

        return new GoalResponse(
                goal.getId(),
                goal.getName(),
                goal.getDescription(),
                goal.getTargetAmount(),
                goal.getCurrentAmount(),
                remaining,
                percent,
                goal.getTargetDate(),
                monthlyNeeded,
                completed
        );
    }
}
