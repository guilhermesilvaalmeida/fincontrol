package com.fincontrol.installments;

import com.fincontrol.installments.dto.InstallmentPurchaseRequest;
import com.fincontrol.installments.dto.InstallmentPurchaseResponse;
import com.fincontrol.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/installment-purchases")
public class InstallmentController {

    private final InstallmentService installmentService;

    public InstallmentController(InstallmentService installmentService) {
        this.installmentService = installmentService;
    }

    @GetMapping
    public ResponseEntity<List<InstallmentPurchaseResponse>> list(@AuthenticationPrincipal CurrentUser currentUser) {
        return ResponseEntity.ok(installmentService.listForUser(currentUser.id()));
    }

    @PostMapping
    public ResponseEntity<InstallmentPurchaseResponse> create(
            @AuthenticationPrincipal CurrentUser currentUser,
            @Valid @RequestBody InstallmentPurchaseRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(installmentService.create(currentUser.id(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID id
    ) {
        installmentService.delete(id, currentUser.id());
        return ResponseEntity.noContent().build();
    }
}
