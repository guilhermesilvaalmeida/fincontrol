package com.fincontrol.categories;

import com.fincontrol.categories.dto.CategoryRequest;
import com.fincontrol.categories.dto.CategoryResponse;
import com.fincontrol.security.CurrentUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> list(@AuthenticationPrincipal CurrentUser currentUser) {
        return ResponseEntity.ok(categoryService.listForUser(currentUser.id()));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(
            @AuthenticationPrincipal CurrentUser currentUser,
            @Valid @RequestBody CategoryRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(currentUser.id(), request));
    }
}
