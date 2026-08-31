package com.fincontrol.auth;

import com.fincontrol.auth.dto.AuthResponse;
import com.fincontrol.auth.dto.LoginRequest;
import com.fincontrol.auth.dto.RegisterRequest;
import com.fincontrol.categories.DefaultCategorySeeder;
import com.fincontrol.common.BusinessException;
import com.fincontrol.security.JwtService;
import com.fincontrol.users.User;
import com.fincontrol.users.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DefaultCategorySeeder defaultCategorySeeder;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtService jwtService = new JwtService("test-secret-key-with-at-least-32-bytes!!", 60);

    @Test
    void register_shouldRejectDuplicateEmail() {
        AuthService service = new AuthService(userRepository, passwordEncoder, jwtService, defaultCategorySeeder);
        when(userRepository.existsByEmail("joao@example.com")).thenReturn(true);

        RegisterRequest request = new RegisterRequest("João", "joao@example.com", "senha1234");

        assertThatThrownBy(() -> service.register(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Já existe uma conta");
    }

    @Test
    void register_shouldHashPasswordBeforeSaving() {
        AuthService service = new AuthService(userRepository, passwordEncoder, jwtService, defaultCategorySeeder);
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        AuthResponse response = service.register(new RegisterRequest("Maria", "maria@example.com", "senhaSegura1"));

        assertThat(response.token()).isNotBlank();
        assertThat(response.user().email()).isEqualTo("maria@example.com");
    }

    @Test
    void login_shouldRejectWrongPassword() {
        AuthService service = new AuthService(userRepository, passwordEncoder, jwtService, defaultCategorySeeder);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("joao@example.com");
        user.setPasswordHash(passwordEncoder.encode("senhaCorreta1"));

        when(userRepository.findByEmail("joao@example.com")).thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest("joao@example.com", "senhaErrada");

        assertThatThrownBy(() -> service.login(request)).isInstanceOf(BadCredentialsException.class);
    }
}
