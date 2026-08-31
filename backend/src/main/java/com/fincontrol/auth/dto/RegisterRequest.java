package com.fincontrol.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Informe seu nome.")
        @Size(max = 120, message = "Nome muito longo.")
        String name,

        @NotBlank(message = "Informe seu e-mail.")
        @Email(message = "E-mail inválido.")
        String email,

        @NotBlank(message = "Informe uma senha.")
        @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres.")
        String password
) {
}
