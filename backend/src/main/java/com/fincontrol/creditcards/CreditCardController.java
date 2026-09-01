package com.fincontrol.creditcards;

import com.fincontrol.creditcards.dto.CreditCardRequest;
import com.fincontrol.creditcards.dto.CreditCardResponse;
import com.fincontrol.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/credit-cards")
public class CreditCardController {

    private final CreditCardService creditCardService;

    public CreditCardController(CreditCardService creditCardService) {
        this.creditCardService = creditCardService;
    }

    @GetMapping
    public ResponseEntity<List<CreditCardResponse>> list(@AuthenticationPrincipal CurrentUser currentUser) {
        return ResponseEntity.ok(creditCardService.listForUser(currentUser.id()));
    }

    @PostMapping
    public ResponseEntity<CreditCardResponse> create(
            @AuthenticationPrincipal CurrentUser currentUser,
            @Valid @RequestBody CreditCardRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(creditCardService.create(currentUser.id(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CreditCardResponse> update(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody CreditCardRequest request
    ) {
        return ResponseEntity.ok(creditCardService.update(id, currentUser.id(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID id
    ) {
        creditCardService.delete(id, currentUser.id());
        return ResponseEntity.noContent().build();
    }
}
