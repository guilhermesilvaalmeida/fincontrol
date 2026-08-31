package com.fincontrol.auth;

import com.fincontrol.auth.dto.AuthResponse;
import com.fincontrol.auth.dto.LoginRequest;
import com.fincontrol.auth.dto.RegisterRequest;
import com.fincontrol.security.CurrentUser;
import com.fincontrol.security.RateLimiter;
import com.fincontrol.users.User;
import com.fincontrol.users.UserRepository;
import com.fincontrol.common.RateLimitExceededException;
import com.fincontrol.common.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final RateLimiter rateLimiter;

    public AuthController(AuthService authService, UserRepository userRepository, RateLimiter rateLimiter) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.rateLimiter = rateLimiter;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        checkRateLimit(httpRequest, "register", 5, 3600); // 5 cadastros/hora por IP
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        checkRateLimit(httpRequest, "login", 10, 300); // 10 tentativas/5min por IP
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserSummary> me(@AuthenticationPrincipal CurrentUser currentUser) {
        User user = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
        return ResponseEntity.ok(new AuthResponse.UserSummary(user.getId(), user.getName(), user.getEmail()));
    }

    private void checkRateLimit(HttpServletRequest request, String scope, int maxAttempts, long windowSeconds) {
        String ip = clientIp(request);
        if (!rateLimiter.allow(scope + ":" + ip, maxAttempts, windowSeconds)) {
            throw new RateLimitExceededException("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
        }
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

