package elovia.eloviaapi.dto;

import java.time.Instant;
import java.util.UUID;

import elovia.eloviaapi.model.SessaoAcompanhamento;
import elovia.eloviaapi.model.StatusSessao;

public record SessaoResponse(
		UUID id,
		UUID alunoId,
		String alunoNome,
		StatusSessao status,
		Instant iniciadaEm,
		Instant finalizadaEm,
		String observacoes) {

	public static SessaoResponse from(SessaoAcompanhamento sessao) {
		return new SessaoResponse(
				sessao.getId(),
				sessao.getAluno().getId(),
				sessao.getAluno().getNome(),
				sessao.getStatus(),
				sessao.getIniciadaEm(),
				sessao.getFinalizadaEm(),
				sessao.getObservacoes());
	}
}
