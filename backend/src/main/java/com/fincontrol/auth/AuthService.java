package com.fincontrol.auth;

import com.fincontrol.auth.dto.AuthResponse;
import com.fincontrol.auth.dto.LoginRequest;
import com.fincontrol.auth.dto.RegisterRequest;
import com.fincontrol.auth.dto.UpdateProfileRequest;
import com.fincontrol.categories.DefaultCategorySeeder;
import com.fincontrol.common.BusinessException;
import com.fincontrol.common.ResourceNotFoundException;
import com.fincontrol.security.JwtService;
import com.fincontrol.users.User;
import com.fincontrol.users.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final DefaultCategorySeeder defaultCategorySeeder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            DefaultCategorySeeder defaultCategorySeeder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.defaultCategorySeeder = defaultCategorySeeder;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BusinessException("Já existe uma conta cadastrada com este e-mail.");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);

        defaultCategorySeeder.seedForUser(user);

        return buildResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Credenciais inválidas.");
        }

        return buildResponse(user);
    }

    private AuthResponse buildResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, new AuthResponse.UserSummary(user.getId(), user.getName(), user.getEmail(), user.getAvatar()));
    }

    @Transactional
    public AuthResponse.UserSummary updateProfile(java.util.UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        user.setName(request.name().trim());
        user.setAvatar(request.avatar());
        userRepository.save(user);

        return new AuthResponse.UserSummary(user.getId(), user.getName(), user.getEmail(), user.getAvatar());
    }
}
