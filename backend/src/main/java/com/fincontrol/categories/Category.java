package com.fincontrol.categories;

import com.fincontrol.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "categories")
public class Category extends BaseEntity {

    /** NULL significa categoria própria do usuário criada a partir de um template padrão. */
    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false, length = 60)
    private String name;

    @Column(length = 10)
    private String icon;

    @Column(length = 20)
    private String color;

    /** Agrupador visual (ex.: "Alimentação", "Casa"). Preparado para virar hierarquia real na Fase 2. */
    @Column(name = "group_name", length = 60)
    private String groupName;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault = false;
}
