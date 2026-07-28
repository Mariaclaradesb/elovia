package elovia.eloviaapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AtualizarPerfilRequest(
		@NotBlank String nome,
		@NotBlank String cpf,
		@Email @NotBlank String email,
		String telefone,
		String escola,
		String cargo,
		String matricula) {
}
