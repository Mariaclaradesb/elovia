package elovia.eloviaapi.dto;

import jakarta.validation.constraints.NotBlank;

public record AlunoRequest(
		@NotBlank String nome,
		String turma,
		String observacoes) {
}
