package com.fincontrol.categories;

import com.fincontrol.categories.dto.CategoryRequest;
import com.fincontrol.categories.dto.CategoryResponse;
import com.fincontrol.common.BusinessException;
import com.fincontrol.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> listForUser(UUID userId) {
        return categoryRepository.findByUserIdOrderByGroupNameAscNameAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponse create(UUID userId, CategoryRequest request) {
        if (categoryRepository.existsByUserIdAndNameIgnoreCase(userId, request.name().trim())) {
            throw new BusinessException("Você já possui uma categoria com esse nome.");
        }

        Category category = new Category();
        category.setUserId(userId);
        category.setName(request.name().trim());
        category.setGroupName(request.groupName() != null ? request.groupName().trim() : "Outros");
        category.setIcon(request.icon());
        category.setColor(request.color() != null ? request.color() : "#6B7280");
        category.setDefault(false);

        return toResponse(categoryRepository.save(category));
    }

    Category getOwned(UUID id, UUID userId) {
        return categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getGroupName(),
                category.getIcon(),
                category.getColor(),
                category.isDefault()
        );
    }
}
