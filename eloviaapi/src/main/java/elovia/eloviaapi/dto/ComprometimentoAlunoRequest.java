package elovia.eloviaapi.dto;

import jakarta.validation.constraints.NotBlank;

public record ComprometimentoAlunoRequest(
		@NotBlank String nome,
		String cid) {
}
