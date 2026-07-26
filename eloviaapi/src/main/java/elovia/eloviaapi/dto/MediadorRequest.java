package elovia.eloviaapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record MediadorRequest(
		@NotBlank String nome,
		@NotBlank String cpf,
		@NotBlank @Email String email,
		@NotBlank String telefone,
		@NotBlank String escola,
		@NotBlank String cargo,
		String matricula) {
}
