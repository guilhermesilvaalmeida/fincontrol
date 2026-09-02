package com.fincontrol.admin;

import com.fincontrol.accounts.AccountRepository;
import com.fincontrol.budgets.BudgetRepository;
import com.fincontrol.common.BusinessException;
import com.fincontrol.creditcards.CreditCardRepository;
import com.fincontrol.goals.GoalRepository;
import com.fincontrol.transactions.TransactionRepository;
import com.fincontrol.users.Role;
import com.fincontrol.users.User;
import com.fincontrol.users.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private CreditCardRepository creditCardRepository;
    @Mock private GoalRepository goalRepository;
    @Mock private BudgetRepository budgetRepository;
    @Mock private AdminAuditLogRepository auditLogRepository;

    private AdminService newService() {
        return new AdminService(userRepository, transactionRepository, accountRepository, creditCardRepository, goalRepository, budgetRepository, auditLogRepository);
    }

    @Test
    void adminCannotDemoteThemselves() {
        AdminService service = newService();
        UUID adminId = UUID.randomUUID();

        User admin = new User();
        admin.setId(adminId);
        admin.setRole(Role.ADMIN);
        when(userRepository.findById(adminId)).thenReturn(Optional.of(admin));

        assertThatThrownBy(() -> service.updateRole(adminId, adminId, Role.USER))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("não pode remover sua própria permissão");
    }

    @Test
    void adminCannotDeactivateThemselves() {
        AdminService service = newService();
        UUID adminId = UUID.randomUUID();

        User admin = new User();
        admin.setId(adminId);
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        when(userRepository.findById(adminId)).thenReturn(Optional.of(admin));

        assertThatThrownBy(() -> service.updateStatus(adminId, adminId, false))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("não pode desativar a própria conta");
    }

    @Test
    void adminCanPromoteAnotherUserToAdmin() {
        AdminService service = newService();
        UUID adminId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();

        User target = new User();
        target.setId(targetId);
        target.setRole(Role.USER);
        when(userRepository.findById(targetId)).thenReturn(Optional.of(target));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = service.updateRole(targetId, adminId, Role.ADMIN);

        assertThat(response.role()).isEqualTo("ADMIN");
    }
}
