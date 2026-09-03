package com.fincontrol.transactions;

import com.fincontrol.accounts.Account;
import com.fincontrol.accounts.AccountRepository;
import com.fincontrol.categories.Category;
import com.fincontrol.categories.CategoryRepository;
import com.fincontrol.common.ResourceNotFoundException;
import com.fincontrol.creditcards.CreditCard;
import com.fincontrol.creditcards.CreditCardRepository;
import com.fincontrol.transactions.dto.TransactionFilter;
import com.fincontrol.transactions.dto.TransactionRequest;
import com.fincontrol.transactions.dto.TransactionResponse;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static com.fincontrol.transactions.TransactionSpecifications.*;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final CreditCardRepository creditCardRepository;

    public TransactionService(
            TransactionRepository transactionRepository,
            AccountRepository accountRepository,
            CategoryRepository categoryRepository,
            CreditCardRepository creditCardRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.creditCardRepository = creditCardRepository;
    }

    public List<TransactionResponse> list(UUID userId, TransactionFilter filter) {
        Specification<Transaction> spec = Specification
                .where(belongsToUser(userId))
                .and(notDeleted())
                .and(hasType(filter.type()))
                .and(hasCategory(filter.categoryId()))
                .and(hasAccount(filter.accountId()))
                .and(hasCreditCard(filter.creditCardId()))
                .and(occurredFrom(filter.from()))
                .and(occurredTo(filter.to()))
                .and(amountFrom(filter.minAmount()))
                .and(amountTo(filter.maxAmount()))
                .and(descriptionContains(filter.query()));

        Sort sort = resolveSort(filter.sort());

        return transactionRepository.findAll(spec, sort).stream()
            .map(transaction -> toResponse(transaction, userId))
                .toList();
    }

    @Transactional
    public TransactionResponse create(UUID userId, TransactionRequest request) {
        Account account = getOwnedAccount(request.accountId(), userId);
        Category category = getOwnedCategory(request.categoryId(), userId);

        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        applyRequest(transaction, request, account, category);

        return toResponse(transactionRepository.save(transaction), userId);
    }

    @Transactional
    public TransactionResponse update(UUID id, UUID userId, TransactionRequest request) {
        Transaction transaction = getOwned(id, userId);
        if (transaction.getInstallmentPurchaseId() != null) {
            throw new com.fincontrol.common.BusinessException("Edite a compra parcelada inteira para manter as parcelas consistentes.");
        }
        Account account = getOwnedAccount(request.accountId(), userId);
        Category category = getOwnedCategory(request.categoryId(), userId);

        applyRequest(transaction, request, account, category);

        return toResponse(transactionRepository.save(transaction), userId);
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Transaction transaction = getOwned(id, userId);
        if (transaction.getInstallmentPurchaseId() != null) {
            throw new com.fincontrol.common.BusinessException("Exclua a compra parcelada inteira para remover todas as parcelas.");
        }
        transaction.setDeletedAt(Instant.now());
        transactionRepository.save(transaction);
    }

    private void applyRequest(Transaction transaction, TransactionRequest request, Account account, Category category) {
        transaction.setType(request.type());
        transaction.setAmount(request.amount());
        transaction.setDescription(request.description().trim());
        transaction.setAccountId(account.getId());
        transaction.setCategoryId(category.getId());
        transaction.setPaymentMethod(request.paymentMethod());
        transaction.setOccurredOn(request.occurredOn());
        transaction.setNotes(request.notes());
    }

    private Transaction getOwned(UUID id, UUID userId) {
        return transactionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada."));
    }

    private Account getOwnedAccount(UUID accountId, UUID userId) {
        return accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada."));
    }

    private Category getOwnedCategory(UUID categoryId, UUID userId) {
        return categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));
    }

    private Sort resolveSort(String sort) {
        if (sort == null) return Sort.by(Sort.Direction.DESC, "occurredOn").and(Sort.by(Sort.Direction.DESC, "createdAt"));
        return switch (sort) {
            case "oldest" -> Sort.by(Sort.Direction.ASC, "occurredOn");
            case "highest" -> Sort.by(Sort.Direction.DESC, "amount");
            case "lowest" -> Sort.by(Sort.Direction.ASC, "amount");
            default -> Sort.by(Sort.Direction.DESC, "occurredOn").and(Sort.by(Sort.Direction.DESC, "createdAt"));
        };
    }

    private TransactionResponse toResponse(Transaction t, UUID userId) {
        Category category = categoryRepository.findByIdAndUserId(t.getCategoryId(), userId).orElse(null);
        Account account = t.getAccountId() != null ? accountRepository.findByIdAndUserId(t.getAccountId(), userId).orElse(null) : null;
        CreditCard creditCard = t.getCreditCardId() != null ? creditCardRepository.findByIdAndUserId(t.getCreditCardId(), userId).orElse(null) : null;

        return new TransactionResponse(
                t.getId(),
                t.getType(),
                t.getAmount(),
                t.getDescription(),
                category == null ? null : new TransactionResponse.CategoryRef(category.getId(), category.getName(), category.getIcon(), category.getColor()),
                account == null ? null : new TransactionResponse.AccountRef(account.getId(), account.getName()),
                creditCard == null ? null : new TransactionResponse.CreditCardRef(creditCard.getId(), creditCard.getName()),
                t.getInstallmentNumber(),
                t.getInstallmentTotal(),
                t.getPaymentMethod(),
                t.getOccurredOn(),
                t.getNotes()
        );
    }
}
