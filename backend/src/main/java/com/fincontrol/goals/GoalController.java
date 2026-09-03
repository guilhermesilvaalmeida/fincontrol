package com.fincontrol.goals;

import com.fincontrol.goals.dto.GoalContributionRequest;
import com.fincontrol.goals.dto.GoalAmountRequest;
import com.fincontrol.goals.dto.GoalRequest;
import com.fincontrol.goals.dto.GoalResponse;
import com.fincontrol.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping
    public ResponseEntity<List<GoalResponse>> list(@AuthenticationPrincipal CurrentUser currentUser) {
        return ResponseEntity.ok(goalService.listForUser(currentUser.id()));
    }

    @PostMapping
    public ResponseEntity<GoalResponse> create(
            @AuthenticationPrincipal CurrentUser currentUser,
            @Valid @RequestBody GoalRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(goalService.create(currentUser.id(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalResponse> update(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody GoalRequest request
    ) {
        return ResponseEntity.ok(goalService.update(id, currentUser.id(), request));
    }

    @PostMapping("/{id}/contributions")
    public ResponseEntity<GoalResponse> contribute(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody GoalContributionRequest request
    ) {
        return ResponseEntity.ok(goalService.contribute(id, currentUser.id(), request));
    }

    @PatchMapping("/{id}/amount")
    public ResponseEntity<GoalResponse> updateAmount(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody GoalAmountRequest request
    ) {
        return ResponseEntity.ok(goalService.updateAmount(id, currentUser.id(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID id
    ) {
        goalService.delete(id, currentUser.id());
        return ResponseEntity.noContent().build();
    }
}
