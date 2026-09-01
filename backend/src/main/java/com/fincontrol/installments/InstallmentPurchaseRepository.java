package com.fincontrol.installments;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InstallmentPurchaseRepository extends JpaRepository<InstallmentPurchase, UUID> {
    List<InstallmentPurchase> findByUserIdOrderByPurchaseDateDesc(UUID userId);
    Optional<InstallmentPurchase> findByIdAndUserId(UUID id, UUID userId);
}
