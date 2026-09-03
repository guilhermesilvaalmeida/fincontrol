package com.fincontrol.installments;

import com.fincontrol.categories.CategoryRepository;
import com.fincontrol.common.ResourceNotFoundException;
import com.fincontrol.creditcards.CreditCard;
import com.fincontrol.creditcards.CreditCardRepository;
import com.fincontrol.installments.dto.InstallmentPurchaseRequest;
import com.fincontrol.installments.dto.InstallmentPurchaseResponse;
import com.fincontrol.transactions.Transaction;
import com.fincontrol.transactions.TransactionRepository;
import com.fincontrol.transactions.TransactionType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Ao registrar uma compra parcelada, o sistema gera automaticamente N transações
 * de despesa (uma por parcela), vinculadas ao cartão e à compra original.
 * Cada parcela cai num mês subsequente, permitindo enxergar o compromisso futuro
 * no dashboard e no detalhe do cartão — não é preciso lançar parcela por parcela à mão.
 */
@Service
public class InstallmentService {

    private final InstallmentPurchaseRepository installmentPurchaseRepository;
    private final TransactionRepository transactionRepository;
    private final CreditCardRepository creditCardRepository;
    private final CategoryRepository categoryRepository;

    public InstallmentService(
            InstallmentPurchaseRepository installmentPurchaseRepository,
            TransactionRepository transactionRepository,
            CreditCardRepository creditCardRepository,
            CategoryRepository categoryRepository
    ) {
        this.installmentPurchaseRepository = installmentPurchaseRepository;
        this.transactionRepository = transactionRepository;
        this.creditCardRepository = creditCardRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<InstallmentPurchaseResponse> listForUser(UUID userId) {
        return installmentPurchaseRepository.findByUserIdOrderByPurchaseDateDesc(userId).stream()
                                .map(purchase -> toResponse(purchase, userId))
                .toList();
    }

    @Transactional
    public InstallmentPurchaseResponse create(UUID userId, InstallmentPurchaseRequest request) {
        CreditCard creditCard = creditCardRepository.findByIdAndUserId(request.creditCardId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cartão não encontrado."));

        categoryRepository.findByIdAndUserId(request.categoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));

        InstallmentPurchase purchase = new InstallmentPurchase();
        purchase.setUserId(userId);
        purchase.setCreditCardId(creditCard.getId());
        purchase.setCategoryId(request.categoryId());
        purchase.setDescription(request.description().trim());
        purchase.setTotalAmount(request.totalAmount());
        purchase.setInstallmentsCount(request.installmentsCount());
        purchase.setPurchaseDate(request.purchaseDate());
        installmentPurchaseRepository.save(purchase);

        List<Transaction> installments = buildInstallmentTransactions(userId, purchase);
        transactionRepository.saveAll(installments);

        return toResponse(purchase, userId);
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        InstallmentPurchase purchase = installmentPurchaseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Compra parcelada não encontrada."));

        List<Transaction> installments = transactionRepository.findByInstallmentPurchaseIdOrderByInstallmentNumberAsc(purchase.getId());
        transactionRepository.deleteAll(installments);
        transactionRepository.flush();

        installmentPurchaseRepository.delete(purchase);
    }

    private List<Transaction> buildInstallmentTransactions(UUID userId, InstallmentPurchase purchase) {
        int count = purchase.getInstallmentsCount();
        BigDecimal baseAmount = purchase.getTotalAmount()
                .divide(BigDecimal.valueOf(count), 2, RoundingMode.DOWN);
        BigDecimal remainder = purchase.getTotalAmount().subtract(baseAmount.multiply(BigDecimal.valueOf(count)));

        List<Transaction> transactions = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            boolean isLast = i == count - 1;
            BigDecimal amount = isLast ? baseAmount.add(remainder) : baseAmount;

            Transaction transaction = new Transaction();
            transaction.setUserId(userId);
            transaction.setType(TransactionType.EXPENSE);
            transaction.setAmount(amount);
            transaction.setDescription(purchase.getDescription() + " (" + (i + 1) + "/" + count + ")");
            transaction.setCategoryId(purchase.getCategoryId());
            transaction.setCreditCardId(purchase.getCreditCardId());
            transaction.setInstallmentPurchaseId(purchase.getId());
            transaction.setInstallmentNumber(i + 1);
            transaction.setInstallmentTotal(count);
            transaction.setPaymentMethod("Crédito");
            transaction.setOccurredOn(purchase.getPurchaseDate().plusMonths(i));

            transactions.add(transaction);
        }
        return transactions;
    }

        private InstallmentPurchaseResponse toResponse(InstallmentPurchase purchase, UUID userId) {
                CreditCard card = creditCardRepository.findByIdAndUserId(purchase.getCreditCardId(), userId).orElse(null);
        BigDecimal installmentAmount = purchase.getTotalAmount()
                .divide(BigDecimal.valueOf(purchase.getInstallmentsCount()), 2, RoundingMode.DOWN);

        List<Transaction> installments = transactionRepository
                .findByInstallmentPurchaseIdOrderByInstallmentNumberAsc(purchase.getId());

        List<InstallmentPurchaseResponse.InstallmentItem> items = installments.stream()
                .map(t -> new InstallmentPurchaseResponse.InstallmentItem(t.getInstallmentNumber(), t.getAmount(), t.getOccurredOn()))
                .toList();

        return new InstallmentPurchaseResponse(
                purchase.getId(),
                purchase.getDescription(),
                purchase.getTotalAmount(),
                purchase.getInstallmentsCount(),
                installmentAmount,
                purchase.getPurchaseDate(),
                purchase.getCreditCardId(),
                card != null ? card.getName() : null,
                items
        );
    }
}
