package elovia.eloviaapi.dto;

import jakarta.validation.constraints.NotBlank;

public record AlterarSenhaRequest(
		String senhaAtual,
		@NotBlank String novaSenha,
		@NotBlank String confirmarSenha) {
}
