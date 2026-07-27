package elovia.eloviaapi.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import elovia.eloviaapi.model.PeriodoAcompanhamento;
import elovia.eloviaapi.model.SessaoAcompanhamento;
import elovia.eloviaapi.model.StatusSessao;

public record SessaoResponse(
		UUID id,
		UUID mediadorId,
		String mediadorNome,
		LocalDate data,
		PeriodoAcompanhamento periodo,
		List<AlunoSessaoResponse> alunos,
		StatusSessao status,
		Instant inicio,
		Instant fim,
		String observacoes) {

	public static SessaoResponse from(SessaoAcompanhamento sessao) {
		return from(sessao, List.of());
	}

	public static SessaoResponse from(SessaoAcompanhamento sessao, List<AlunoSessaoResponse> alunos) {
		var mediador = sessao.getMediador();
		return new SessaoResponse(
				sessao.getId(),
				mediador != null ? mediador.getId() : null,
				mediador != null ? mediador.getNome() : null,
				sessao.getData(),
				sessao.getPeriodo(),
				alunos,
				sessao.getStatus(),
				sessao.getInicio(),
				sessao.getFim(),
				sessao.getObservacoes());
	}
}
