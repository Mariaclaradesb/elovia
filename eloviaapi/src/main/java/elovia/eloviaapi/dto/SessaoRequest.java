package elovia.eloviaapi.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import elovia.eloviaapi.model.PeriodoAcompanhamento;
import jakarta.validation.constraints.NotNull;

public record SessaoRequest(
		UUID alunoId,
		@NotNull List<UUID> alunoIds,
		LocalDate data,
		@NotNull PeriodoAcompanhamento periodo,
		String observacoes) {
}
