package com.fincontrol.accounts;

import com.fincontrol.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "accounts")
public class Account extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 80)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccountType type;

    @Column(length = 80)
    private String institution;

    @Column(name = "initial_balance", nullable = false, precision = 14, scale = 2)
    private BigDecimal initialBalance = BigDecimal.ZERO;

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
