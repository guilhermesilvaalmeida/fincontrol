package com.fincontrol.admin;

import com.fincontrol.accounts.AccountRepository;
import com.fincontrol.admin.dto.*;
import com.fincontrol.budgets.BudgetRepository;
import com.fincontrol.common.BusinessException;
import com.fincontrol.common.ResourceNotFoundException;
import com.fincontrol.creditcards.CreditCardRepository;
import com.fincontrol.goals.GoalRepository;
import com.fincontrol.transactions.TransactionRepository;
import com.fincontrol.users.Role;
import com.fincontrol.users.User;
import com.fincontrol.users.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static com.fincontrol.users.UserSpecifications.*;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CreditCardRepository creditCardRepository;
    private final GoalRepository goalRepository;
    private final BudgetRepository budgetRepository;
    private final AdminAuditLogRepository auditLogRepository;

    public AdminService(
            UserRepository userRepository,
            TransactionRepository transactionRepository,
            AccountRepository accountRepository,
            CreditCardRepository creditCardRepository,
            GoalRepository goalRepository,
            BudgetRepository budgetRepository,
            AdminAuditLogRepository auditLogRepository
    ) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.creditCardRepository = creditCardRepository;
        this.goalRepository = goalRepository;
        this.budgetRepository = budgetRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public AdminDashboardResponse getDashboard() {
        List<AdminUserResponse> recent = userRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();

        return new AdminDashboardResponse(
                userRepository.count(),
                userRepository.countByActiveTrue(),
                userRepository.countByActiveFalse(),
                transactionRepository.count(),
                creditCardRepository.count(),
                accountRepository.count(),
                recent
        );
    }

    public List<AdminUserResponse> listUsers(AdminUserFilter filter) {
        Specification<User> spec = Specification
                .where(nameOrEmailContains(filter.query()))
                .and(hasRole(filter.role()))
                .and(isActive(filter.active()));

        return userRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::toResponse)
                .toList();
    }

    public AdminUserDetailResponse getUserDetail(UUID id) {
        User user = getOrThrow(id);

        return new AdminUserDetailResponse(
                user.getId(), user.getName(), user.getEmail(), user.getAvatar(),
                user.getRole().name(), user.isActive(), user.getCreatedAt(),
                transactionRepository.countByUserIdAndDeletedAtIsNull(user.getId()),
                accountRepository.countByUserIdAndDeletedAtIsNull(user.getId()),
                creditCardRepository.countByUserIdAndDeletedAtIsNull(user.getId()),
                goalRepository.countByUserId(user.getId()),
                budgetRepository.countByUserId(user.getId())
        );
    }

    @Transactional
    public AdminUserResponse updateRole(UUID targetId, UUID currentAdminId, Role newRole) {
        User target = getOrThrow(targetId);

        if (target.getId().equals(currentAdminId) && newRole != Role.ADMIN) {
            throw new BusinessException("Você não pode remover sua própria permissão de administrador.");
        }

        Role previousRole = target.getRole();
        target.setRole(newRole);
        userRepository.save(target);

        log(currentAdminId, "ROLE_CHANGED", target.getId(), previousRole + " → " + newRole);

        return toResponse(target);
    }

    @Transactional
    public AdminUserResponse updateStatus(UUID targetId, UUID currentAdminId, boolean active) {
        User target = getOrThrow(targetId);

        if (target.getId().equals(currentAdminId) && !active) {
            throw new BusinessException("Você não pode desativar a própria conta.");
        }

        target.setActive(active);
        userRepository.save(target);

        log(currentAdminId, active ? "USER_ACTIVATED" : "USER_DEACTIVATED", target.getId(), null);

        return toResponse(target);
    }

    private void log(UUID adminId, String action, UUID targetUserId, String details) {
        AdminAuditLog entry = new AdminAuditLog();
        entry.setAdminUserId(adminId);
        entry.setAction(action);
        entry.setTargetUserId(targetUserId);
        entry.setDetails(details);
        auditLogRepository.save(entry);
    }

    private User getOrThrow(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
    }

    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
                user.getId(), user.getName(), user.getEmail(), user.getAvatar(),
                user.getRole().name(), user.isActive(), user.getCreatedAt()
        );
    }
}
