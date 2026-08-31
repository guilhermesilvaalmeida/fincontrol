package com.fincontrol.categories;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findByUserIdOrderByGroupNameAscNameAsc(UUID userId);
    Optional<Category> findByIdAndUserId(UUID id, UUID userId);
    boolean existsByUserIdAndNameIgnoreCase(UUID userId, String name);
}
