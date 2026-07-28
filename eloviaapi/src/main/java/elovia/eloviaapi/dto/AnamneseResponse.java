package elovia.eloviaapi.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import elovia.eloviaapi.model.Anamnese;

public record AnamneseResponse(
		UUID id, UUID alunoId, String alunoNome, int etapaAtual, int percentualPreenchimento,
		String professorSalaRecursos, String profissionalApoio, String funcaoProfissionalApoio, String motivoMatriculaSrm,
		String quemEAluno, String ondeMora, List<String> comQuemMora, String desenvolvimento, String gestacao,
		String complicacoesParto, Boolean possuiIrmaos, Integer quantidadeIrmaos, List<String> comunicacao,
		Boolean usaMedicacao, List<AnamneseMedicamentoRequest> medicamentos, List<AnamneseTerapiaRequest> terapias,
		String alergias, String restricoesAlimentares, String crisesRecorrentes, String informacoesMedicas,
		String potencialidades, String interesses, String maiorFacilidade, String maiorDificuldade,
		String necessitaAdaptacoes, String reacaoMudancas, String hiperfoco, List<String> formasAprendizagem,
		String responsavelRespondente, String rotinaCasa, String expectativasFamilia, String orientacaoImportante,
		String comportamentosForaEscola, String observacaoSalaOutrosEspacos, String professorRegente,
		String salaRecursos, String equipePedagogica, String observacoesGerais,
		List<ComprometimentoAlunoResponse> diagnosticos, List<DocumentoAlunoResponse> anexos,
		String criadoPorNome, String atualizadoPorNome, Instant criadoEm, Instant atualizadoEm) {

	public static AnamneseResponse from(Anamnese a) {
		return new AnamneseResponse(
				a.getId(), a.getAluno().getId(), a.getAluno().getNome(), a.getEtapaAtual(), a.getPercentualPreenchimento(),
				a.getProfessorSalaRecursos(), a.getProfissionalApoio(), a.getFuncaoProfissionalApoio(), a.getMotivoMatriculaSrm(),
				a.getQuemEAluno(), a.getOndeMora(), split(a.getComQuemMora()), a.getDesenvolvimento(), a.getGestacao(),
				a.getComplicacoesParto(), a.getPossuiIrmaos(), a.getQuantidadeIrmaos(), split(a.getComunicacao()),
				a.getUsaMedicacao(),
				a.getMedicamentos().stream().map(m -> new AnamneseMedicamentoRequest(m.getNome(), m.getDosagem(), m.getHorario(), m.getObservacoes())).toList(),
				a.getTerapias().stream().map(t -> new AnamneseTerapiaRequest(t.getTipo(), t.getFrequencia(), t.getProfissional(), t.getObservacoes())).toList(),
				a.getAlergias(), a.getRestricoesAlimentares(), a.getCrisesRecorrentes(), a.getInformacoesMedicas(),
				a.getPotencialidades(), a.getInteresses(), a.getMaiorFacilidade(), a.getMaiorDificuldade(),
				a.getNecessitaAdaptacoes(), a.getReacaoMudancas(), a.getHiperfoco(), split(a.getFormasAprendizagem()),
				a.getResponsavelRespondente(), a.getRotinaCasa(), a.getExpectativasFamilia(), a.getOrientacaoImportante(),
				a.getComportamentosForaEscola(), a.getObservacaoSalaOutrosEspacos(), a.getProfessorRegente(),
				a.getSalaRecursos(), a.getEquipePedagogica(), a.getObservacoesGerais(),
				a.getDiagnosticos().stream().map(d -> new ComprometimentoAlunoResponse(d.getId(), d.getComprometimento(), d.getCid())).toList(),
				a.getAnexos().stream().map(anexo -> DocumentoAlunoResponse.from(anexo.getDocumento())).toList(),
				a.getCriadoPor() != null ? a.getCriadoPor().getNome() : null,
				a.getAtualizadoPor() != null ? a.getAtualizadoPor().getNome() : null,
				a.getCriadoEm(), a.getAtualizadoEm());
	}

	private static List<String> split(String value) {
		return value == null || value.isBlank() ? List.of() : value.lines().filter(v -> !v.isBlank()).toList();
	}
}
