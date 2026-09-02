package com.fincontrol.users;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Promove a UM único usuário — aquele cujo e-mail está em ADMIN_EMAIL — para a role ADMIN.
 *
 * Regras de segurança:
 * - Nunca cria uma conta nova: só age se o e-mail já existir no banco.
 * - Nunca promove ninguém em massa: afeta no máximo 1 usuário, o do e-mail configurado.
 * - É idempotente: rodar de novo não duplica nem quebra nada — se o usuário já é ADMIN, não faz nada.
 * - Se ADMIN_EMAIL não estiver configurado, não faz absolutamente nada (comportamento padrão seguro).
 * - Nenhuma senha ou credencial é definida aqui — a senha continua sendo a que o usuário já usa para logar.
 */
@Component
public class AdminPromotionRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminPromotionRunner.class);

    private final UserRepository userRepository;
    private final String adminEmail;

    public AdminPromotionRunner(UserRepository userRepository, @Value("${app.admin.email:}") String adminEmail) {
        this.userRepository = userRepository;
        this.adminEmail = adminEmail;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (adminEmail == null || adminEmail.isBlank()) {
            log.debug("ADMIN_EMAIL não configurado — nenhuma promoção automática de administrador será feita.");
            return;
        }

        String normalizedEmail = adminEmail.trim().toLowerCase();
        userRepository.findByEmail(normalizedEmail).ifPresentOrElse(user -> {
            if (user.getRole() == Role.ADMIN) {
                log.info("Usuário {} já é ADMIN — nada a fazer.", normalizedEmail);
                return;
            }
            user.setRole(Role.ADMIN);
            userRepository.save(user);
            log.info("Usuário {} promovido a ADMIN via ADMIN_EMAIL.", normalizedEmail);
        }, () -> log.warn(
                "ADMIN_EMAIL={} está configurado, mas nenhum usuário com esse e-mail foi encontrado. " +
                        "Cadastre-se normalmente com esse e-mail e reinicie a aplicação para a promoção acontecer.",
                normalizedEmail
        ));
    }
}
