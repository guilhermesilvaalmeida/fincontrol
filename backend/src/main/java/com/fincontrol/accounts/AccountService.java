package com.fincontrol.accounts;

import com.fincontrol.accounts.dto.AccountRequest;
import com.fincontrol.accounts.dto.AccountResponse;
import com.fincontrol.common.ResourceNotFoundException;
import com.fincontrol.transactions.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public AccountService(AccountRepository accountRepository, TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<AccountResponse> listForUser(UUID userId) {
        return accountRepository.findByUserIdAndDeletedAtIsNullOrderByNameAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AccountResponse create(UUID userId, AccountRequest request) {
        Account account = new Account();
        account.setUserId(userId);
        applyRequest(account, request);

        return toResponse(accountRepository.save(account));
    }

    @Transactional
    public AccountResponse update(UUID id, UUID userId, AccountRequest request) {
        Account account = getOwned(id, userId);
        applyRequest(account, request);

        return toResponse(accountRepository.save(account));
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Account account = getOwned(id, userId);
        account.setDeletedAt(Instant.now());
        accountRepository.save(account);
    }

    private void applyRequest(Account account, AccountRequest request) {
        account.setName(request.name().trim());
        account.setType(request.type());
        account.setInstitution(request.institution());
        account.setInitialBalance(request.initialBalance());
    }

    private Account getOwned(UUID id, UUID userId) {
        return accountRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada."));
    }

    private AccountResponse toResponse(Account account) {
        var netAmount = transactionRepository.sumNetAmountByAccount(account.getId(), account.getUserId());
        var currentBalance = account.getInitialBalance().add(netAmount);

        return new AccountResponse(
                account.getId(),
                account.getName(),
                account.getType(),
                account.getInstitution(),
                account.getInitialBalance(),
                currentBalance
        );
    }
}
