package com.fincontrol.accounts;

import com.fincontrol.accounts.dto.AccountRequest;
import com.fincontrol.accounts.dto.AccountResponse;
import com.fincontrol.transactions.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Test
    void currentBalance_shouldBeInitialBalancePlusNetTransactions() {
        AccountService service = new AccountService(accountRepository, transactionRepository);
        UUID userId = UUID.randomUUID();

        Account account = new Account();
        account.setUserId(userId);
        account.setName("Nubank");
        account.setType(AccountType.CHECKING);
        account.setInitialBalance(new BigDecimal("1000.00"));

        when(accountRepository.findByUserIdAndDeletedAtIsNullOrderByNameAsc(userId)).thenReturn(List.of(account));
        when(transactionRepository.sumNetAmountByAccount(account.getId(), userId)).thenReturn(new BigDecimal("-235.50"));

        List<AccountResponse> result = service.listForUser(userId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).currentBalance()).isEqualByComparingTo("764.50");
    }

    @Test
    void create_shouldPersistAccountOwnedByUser() {
        AccountService service = new AccountService(accountRepository, transactionRepository);
        UUID userId = UUID.randomUUID();
        AccountRequest request = new AccountRequest("Carteira", AccountType.CASH, null, new BigDecimal("50.00"));

        when(accountRepository.save(org.mockito.ArgumentMatchers.any(Account.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.sumNetAmountByAccount(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
                .thenReturn(BigDecimal.ZERO);

        AccountResponse response = service.create(userId, request);

        assertThat(response.currentBalance()).isEqualByComparingTo("50.00");
        assertThat(response.name()).isEqualTo("Carteira");
    }
}
