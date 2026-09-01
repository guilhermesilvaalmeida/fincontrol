package com.fincontrol.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Informe seu nome.")
        @Size(max = 120, message = "Nome muito longo.")
        String name,

        @Size(max = 400000, message = "Imagem muito grande. Escolha uma foto menor.")
        String avatar // data URI base64 (ex: "data:image/jpeg;base64,...") ou null para remover
) {
}
