package elovia.eloviaapi.dto;

import java.util.List;

public record AnamneseRequest(
		String serie,
		String responsavelNome,
		String responsavelParentesco,
		String responsavelTelefone,
		List<String> comQuemMora,
		String comQuemMoraOutro,
		String ondeMora,
		String acompanhaRotinaEscolar,
		String descricaoFamilia,
		String interessesPotencialidades,
		String atividadesPreferidas,
		String dificuldadeImportante,
		String orientacaoEscola,
		List<ComprometimentoAlunoRequest> diagnosticos,
		Boolean usaMedicacao,
		List<AnamneseMedicamentoRequest> medicamentos,
		List<String> terapias,
		String terapiaOutra,
		String alergias,
		String restricoesAlimentares,
		String comunicacaoTipo,
		String comunicacaoOutra,
		String comoPedeAjuda,
		String adaptacaoEscolar,
		String estrategiasFuncionam,
		String recomendacaoProfessorAnterior,
		String observacoesGerais) {}
