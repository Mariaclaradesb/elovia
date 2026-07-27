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
		var aluno = observacao.getAluno();
		return new ObservacaoResponse(
				observacao.getId(),
				observacao.getSessao().getId(),
				aluno.getId(),
				aluno.getNome(),
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
