package elovia.eloviaapi.dto;

import java.util.UUID;

import elovia.eloviaapi.model.Aluno;

public record AlunoSessaoResponse(
		UUID id,
		String nome,
		String foto,
		String turma,
		long quantidadeRegistros) {

	public static AlunoSessaoResponse from(Aluno aluno, long quantidadeRegistros) {
		return from(aluno, aluno.getFoto(), quantidadeRegistros);
	}

	public static AlunoSessaoResponse from(Aluno aluno, String foto, long quantidadeRegistros) {
		return new AlunoSessaoResponse(aluno.getId(), aluno.getNome(), foto, aluno.getTurma(), quantidadeRegistros);
	}
}
