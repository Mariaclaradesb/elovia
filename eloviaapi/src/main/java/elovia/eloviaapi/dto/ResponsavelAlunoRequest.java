package elovia.eloviaapi.dto;

import jakarta.validation.constraints.NotBlank;

public record ResponsavelAlunoRequest(
		@NotBlank String nome,
		@NotBlank String telefone,
		String email) {
}
