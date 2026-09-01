package com.fincontrol.creditcards;

import com.fincontrol.creditcards.dto.CreditCardRequest;
import com.fincontrol.creditcards.dto.CreditCardResponse;
import com.fincontrol.common.ResourceNotFoundException;
import com.fincontrol.transactions.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class CreditCardService {

    private final CreditCardRepository creditCardRepository;
    private final TransactionRepository transactionRepository;

    public CreditCardService(CreditCardRepository creditCardRepository, TransactionRepository transactionRepository) {
        this.creditCardRepository = creditCardRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<CreditCardResponse> listForUser(UUID userId) {
        return creditCardRepository.findByUserIdAndDeletedAtIsNullOrderByNameAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CreditCardResponse create(UUID userId, CreditCardRequest request) {
        CreditCard card = new CreditCard();
        card.setUserId(userId);
        applyRequest(card, request);

        return toResponse(creditCardRepository.save(card));
    }

    @Transactional
    public CreditCardResponse update(UUID id, UUID userId, CreditCardRequest request) {
        CreditCard card = getOwned(id, userId);
        applyRequest(card, request);

        return toResponse(creditCardRepository.save(card));
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        CreditCard card = getOwned(id, userId);
        card.setDeletedAt(Instant.now());
        creditCardRepository.save(card);
    }

    CreditCard getOwned(UUID id, UUID userId) {
        return creditCardRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cartão não encontrado."));
    }

    private void applyRequest(CreditCard card, CreditCardRequest request) {
        card.setName(request.name().trim());
        card.setBank(request.bank());
        card.setCreditLimit(request.creditLimit());
        card.setClosingDay(request.closingDay());
        card.setDueDay(request.dueDay());
    }

    private CreditCardResponse toResponse(CreditCard card) {
        var committed = transactionRepository.sumCommittedByCreditCard(card.getId(), card.getUserId(), LocalDate.now().withDayOfMonth(1));
        var available = card.getCreditLimit().subtract(committed);

        return new CreditCardResponse(
                card.getId(),
                card.getName(),
                card.getBank(),
                card.getCreditLimit(),
                card.getClosingDay(),
                card.getDueDay(),
                committed,
                available
        );
    }
}
