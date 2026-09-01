package com.fincontrol.budgets;

import com.fincontrol.budgets.dto.BudgetRequest;
import com.fincontrol.budgets.dto.BudgetResponse;
import com.fincontrol.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> list(@AuthenticationPrincipal CurrentUser currentUser) {
        return ResponseEntity.ok(budgetService.listForUser(currentUser.id()));
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> create(
            @AuthenticationPrincipal CurrentUser currentUser,
            @Valid @RequestBody BudgetRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.create(currentUser.id(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> update(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody BudgetRequest request
    ) {
        return ResponseEntity.ok(budgetService.update(id, currentUser.id(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID id
    ) {
        budgetService.delete(id, currentUser.id());
        return ResponseEntity.noContent().build();
    }
}
