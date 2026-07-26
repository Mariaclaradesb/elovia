package elovia.eloviaapi.dto;

import jakarta.validation.constraints.NotBlank;

public record AlterarSenhaRequest(
		@NotBlank String senhaAtual,
		@NotBlank String novaSenha,
		@NotBlank String confirmarSenha) {
}
