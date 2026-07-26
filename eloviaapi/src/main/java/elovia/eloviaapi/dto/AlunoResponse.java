package elovia.eloviaapi.dto;

import java.time.Instant;
import java.util.UUID;

import elovia.eloviaapi.model.Aluno;

public record AlunoResponse(
		UUID id,
		String nome,
		String turma,
		String observacoes,
		boolean ativo,
		Instant criadoEm,
		Instant atualizadoEm) {

	public static AlunoResponse from(Aluno aluno) {
		return new AlunoResponse(
				aluno.getId(),
				aluno.getNome(),
				aluno.getTurma(),
				aluno.getObservacoes(),
				aluno.isAtivo(),
				aluno.getCriadoEm(),
				aluno.getAtualizadoEm());
	}
}
