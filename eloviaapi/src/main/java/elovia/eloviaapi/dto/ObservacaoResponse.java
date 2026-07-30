package elovia.eloviaapi.dto;

import java.time.Instant;
import java.util.UUID;

import elovia.eloviaapi.model.CategoriaObservacao;
import elovia.eloviaapi.model.Observacao;
import elovia.eloviaapi.model.TipoRegistro;

public record ObservacaoResponse(
		UUID id,
		UUID sessaoId,
		UUID alunoId,
		String alunoNome,
		String alunoFoto,
		CategoriaObservacao categoria,
		String descricao,
		String disciplina,
		String local,
		String estrategia,
		String resultado,
		String observacaoComplementar,
		TipoRegistro tipoRegistro,
		String audioUrl,
		Instant createdAt,
		Instant updatedAt) {

	public static ObservacaoResponse from(Observacao observacao) {
		return from(observacao, observacao.getAluno().getFoto());
	}

	public static ObservacaoResponse from(Observacao observacao, String alunoFoto) {
		var aluno = observacao.getAluno();
		return new ObservacaoResponse(
				observacao.getId(),
				observacao.getSessao().getId(),
				aluno.getId(),
				aluno.getNome(),
				alunoFoto,
				observacao.getCategoria(),
				observacao.getDescricao(),
				observacao.getDisciplina(),
				observacao.getLocal(),
				observacao.getEstrategia(),
				observacao.getResultado(),
				observacao.getObservacaoComplementar(),
				observacao.getTipoRegistro(),
				observacao.getAudioUrl(),
				observacao.getCreatedAt(),
				observacao.getUpdatedAt());
	}
}
