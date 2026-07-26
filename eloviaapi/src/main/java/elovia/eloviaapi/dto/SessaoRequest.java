package elovia.eloviaapi.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record SessaoRequest(
		@NotNull UUID alunoId,
		String observacoes) {
}
