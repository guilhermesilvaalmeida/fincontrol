package com.fincontrol.transactions;

import com.fincontrol.security.CurrentUser;
import com.fincontrol.transactions.dto.TransactionFilter;
import com.fincontrol.transactions.dto.TransactionRequest;
import com.fincontrol.transactions.dto.TransactionResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> list(
            @AuthenticationPrincipal CurrentUser currentUser,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID accountId,
            @RequestParam(required = false) UUID creditCardId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String sort
    ) {
        TransactionFilter filter = new TransactionFilter(type, categoryId, accountId, creditCardId, from, to, minAmount, maxAmount, q, sort);
        return ResponseEntity.ok(transactionService.list(currentUser.id(), filter));
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(
            @AuthenticationPrincipal CurrentUser currentUser,
            @Valid @RequestBody TransactionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.create(currentUser.id(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> update(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody TransactionRequest request
    ) {
        return ResponseEntity.ok(transactionService.update(id, currentUser.id(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID id
    ) {
        transactionService.delete(id, currentUser.id());
        return ResponseEntity.noContent().build();
    }
}
