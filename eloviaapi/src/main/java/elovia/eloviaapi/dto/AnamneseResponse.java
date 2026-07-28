package elovia.eloviaapi.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import elovia.eloviaapi.model.Anamnese;

public record AnamneseResponse(
		UUID id, UUID alunoId, String alunoNome, int etapaAtual, int percentualPreenchimento,
		String serie, String responsavelNome, String responsavelParentesco, String responsavelTelefone,
		List<String> comQuemMora, String comQuemMoraOutro, String ondeMora, String acompanhaRotinaEscolar,
		String descricaoFamilia, String interessesPotencialidades, String atividadesPreferidas,
		String dificuldadeImportante, String orientacaoEscola,
		List<ComprometimentoAlunoResponse> diagnosticos,
		Boolean usaMedicacao, List<AnamneseMedicamentoRequest> medicamentos,
		List<String> terapias, String terapiaOutra, String alergias, String restricoesAlimentares,
		String comunicacaoTipo, String comunicacaoOutra, String comoPedeAjuda,
		String adaptacaoEscolar, String estrategiasFuncionam, String recomendacaoProfessorAnterior,
		String observacoesGerais, List<DocumentoAlunoResponse> anexos,
		String criadoPorNome, String atualizadoPorNome, Instant criadoEm, Instant atualizadoEm) {

	public static AnamneseResponse from(Anamnese a) {
		return new AnamneseResponse(
				a.getId(), a.getAluno().getId(), a.getAluno().getNome(), a.getEtapaAtual(), a.getPercentualPreenchimento(),
				a.getSerie(), a.getResponsavelNome(), a.getResponsavelParentesco(), a.getResponsavelTelefone(),
				split(a.getComQuemMora()), a.getComQuemMoraOutro(), a.getOndeMora(), a.getAcompanhaRotinaEscolar(),
				a.getDescricaoFamilia(), a.getInteressesPotencialidades(), a.getAtividadesPreferidas(),
				a.getDificuldadeImportante(), a.getOrientacaoEscola(),
				a.getDiagnosticos().stream().map(d -> new ComprometimentoAlunoResponse(d.getId(), d.getComprometimento(), d.getCid())).toList(),
				a.getUsaMedicacao(),
				a.getMedicamentos().stream().map(m -> new AnamneseMedicamentoRequest(m.getNome(), m.getDosagem(), m.getObservacoes())).toList(),
				a.getTerapias().stream().map(t -> t.getTipo()).toList(), a.getTerapiaOutra(),
				a.getAlergias(), a.getRestricoesAlimentares(),
				a.getComunicacaoTipo(), a.getComunicacaoOutra(), a.getComoPedeAjuda(),
				a.getAdaptacaoEscolar(), a.getEstrategiasFuncionam(), a.getRecomendacaoProfessorAnterior(),
				a.getObservacoesGerais(),
				a.getAnexos().stream().map(anexo -> DocumentoAlunoResponse.from(anexo.getDocumento())).toList(),
				a.getCriadoPor() != null ? a.getCriadoPor().getNome() : null,
				a.getAtualizadoPor() != null ? a.getAtualizadoPor().getNome() : null,
				a.getCriadoEm(), a.getAtualizadoEm());
	}

	private static List<String> split(String value) {
		return value == null || value.isBlank() ? List.of() : value.lines().filter(v -> !v.isBlank()).toList();
	}
}
