package com.fincontrol.installments;

import com.fincontrol.categories.CategoryRepository;
import com.fincontrol.creditcards.CreditCard;
import com.fincontrol.creditcards.CreditCardRepository;
import com.fincontrol.installments.dto.InstallmentPurchaseRequest;
import com.fincontrol.installments.dto.InstallmentPurchaseResponse;
import com.fincontrol.transactions.Transaction;
import com.fincontrol.transactions.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InstallmentServiceTest {

    @Mock
    private InstallmentPurchaseRepository installmentPurchaseRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CreditCardRepository creditCardRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Test
    void create_shouldSplitAmountAcrossInstallments_puttingRemainderOnLast() {
        InstallmentService service = new InstallmentService(
                installmentPurchaseRepository, transactionRepository, creditCardRepository, categoryRepository
        );

        UUID userId = UUID.randomUUID();
        UUID cardId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();

        CreditCard card = new CreditCard();
        card.setId(cardId);
        card.setUserId(userId);
        card.setName("Nubank");

        when(creditCardRepository.findByIdAndUserId(cardId, userId)).thenReturn(Optional.of(card));
        when(categoryRepository.findByIdAndUserId(categoryId, userId)).thenReturn(Optional.of(mockCategory()));
        when(installmentPurchaseRepository.save(any())).thenAnswer(inv -> {
            InstallmentPurchase p = inv.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });
        when(creditCardRepository.findById(cardId)).thenReturn(Optional.of(card));
        when(transactionRepository.findByInstallmentPurchaseIdOrderByInstallmentNumberAsc(any()))
                .thenReturn(List.of());

        // R$ 100,00 em 3x -> 33,33 + 33,33 + 33,34 (resto vai pra última parcela)
        InstallmentPurchaseRequest request = new InstallmentPurchaseRequest(
                "Compra teste", new BigDecimal("100.00"), 3, cardId, categoryId, LocalDate.of(2026, 1, 15)
        );

        InstallmentPurchaseResponse response = service.create(userId, request);

        ArgumentCaptor<List<Transaction>> captor = ArgumentCaptor.forClass(List.class);
        org.mockito.Mockito.verify(transactionRepository).saveAll(captor.capture());
        List<Transaction> installments = captor.getValue();

        assertThat(installments).hasSize(3);
        assertThat(installments.get(0).getAmount()).isEqualByComparingTo("33.33");
        assertThat(installments.get(1).getAmount()).isEqualByComparingTo("33.33");
        assertThat(installments.get(2).getAmount()).isEqualByComparingTo("33.34"); // resto absorvido na última

        BigDecimal sum = installments.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(sum).isEqualByComparingTo("100.00"); // soma das parcelas bate com o total exato

        assertThat(installments.get(0).getOccurredOn()).isEqualTo(LocalDate.of(2026, 1, 15));
        assertThat(installments.get(2).getOccurredOn()).isEqualTo(LocalDate.of(2026, 3, 15));
        assertThat(response.description()).isEqualTo("Compra teste");
    }

    private com.fincontrol.categories.Category mockCategory() {
        com.fincontrol.categories.Category category = new com.fincontrol.categories.Category();
        category.setId(UUID.randomUUID());
        category.setName("Compras");
        return category;
    }
}
