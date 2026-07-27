package elovia.eloviaapi.dto;

import java.util.UUID;

import elovia.eloviaapi.model.CategoriaObservacao;
import elovia.eloviaapi.model.TipoRegistro;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ObservacaoRequest(
		@NotNull UUID sessaoId,
		@NotNull UUID alunoId,
		@NotNull CategoriaObservacao categoria,
		@NotBlank String descricao,
		String disciplina,
		String local,
		String estrategia,
		String resultado,
		String observacaoComplementar,
		TipoRegistro tipoRegistro,
		String audioUrl) {
}
