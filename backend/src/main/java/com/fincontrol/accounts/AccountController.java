package com.fincontrol.accounts;

import com.fincontrol.accounts.dto.AccountRequest;
import com.fincontrol.accounts.dto.AccountResponse;
import com.fincontrol.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> list(@AuthenticationPrincipal CurrentUser currentUser) {
        return ResponseEntity.ok(accountService.listForUser(currentUser.id()));
    }

    @PostMapping
    public ResponseEntity<AccountResponse> create(
            @AuthenticationPrincipal CurrentUser currentUser,
            @Valid @RequestBody AccountRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.create(currentUser.id(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> update(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody AccountRequest request
    ) {
        return ResponseEntity.ok(accountService.update(id, currentUser.id(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID id
    ) {
        accountService.delete(id, currentUser.id());
        return ResponseEntity.noContent().build();
    }
}
