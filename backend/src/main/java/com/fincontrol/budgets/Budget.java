package com.fincontrol.budgets;

import com.fincontrol.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Orçamento mensal recorrente por categoria — o mesmo limite vale todo mês
 * (não é preciso recriar o orçamento mês a mês). O consumo é sempre calculado
 * em tempo real a partir das transações do mês corrente, nunca armazenado.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "budgets")
public class Budget extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;
}
