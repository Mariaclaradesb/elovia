package elovia.eloviaapi.dto;

import java.util.UUID;

import elovia.eloviaapi.model.ComprometimentoAluno;

public record ComprometimentoAlunoResponse(
		UUID id,
		String nome,
		String cid) {

	public static ComprometimentoAlunoResponse from(ComprometimentoAluno comprometimento) {
		return new ComprometimentoAlunoResponse(
				comprometimento.getId(),
				comprometimento.getNome(),
				comprometimento.getCid());
	}
}
