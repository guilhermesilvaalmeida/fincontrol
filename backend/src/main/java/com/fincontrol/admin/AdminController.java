package com.fincontrol.admin;

import com.fincontrol.admin.dto.*;
import com.fincontrol.common.BusinessException;
import com.fincontrol.security.CurrentUser;
import com.fincontrol.users.Role;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Todos os endpoints aqui já exigem ROLE_ADMIN no SecurityConfig (requestMatchers("/api/admin/**")).
 * Isso significa que, mesmo que alguém descubra a URL, uma tentativa de acesso sem essa role
 * recebe 403 do Spring Security antes mesmo de chegar a este controller.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> dashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> users(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean active
    ) {
        return ResponseEntity.ok(adminService.listUsers(new AdminUserFilter(q, role, active)));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserDetailResponse> userDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getUserDetail(id));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<AdminUserResponse> updateRole(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRoleRequest request
    ) {
        return ResponseEntity.ok(adminService.updateRole(id, currentUser.id(), request.role()));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<AdminUserResponse> updateStatus(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        if (request.active() == null) {
            throw new BusinessException("Informe o novo status.");
        }
        return ResponseEntity.ok(adminService.updateStatus(id, currentUser.id(), request.active()));
    }
}
