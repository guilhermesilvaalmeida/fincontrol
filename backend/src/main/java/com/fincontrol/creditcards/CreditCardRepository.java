package com.fincontrol.creditcards;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CreditCardRepository extends JpaRepository<CreditCard, UUID> {
    List<CreditCard> findByUserIdAndDeletedAtIsNullOrderByNameAsc(UUID userId);
    Optional<CreditCard> findByIdAndUserId(UUID id, UUID userId);
}
