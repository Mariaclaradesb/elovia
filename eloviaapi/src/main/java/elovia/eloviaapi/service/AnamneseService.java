package elovia.eloviaapi.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import elovia.eloviaapi.dto.AnamneseHistoricoResponse;
import elovia.eloviaapi.dto.AnamnesePesquisaResponse;
import elovia.eloviaapi.dto.AnamneseRequest;
import elovia.eloviaapi.dto.AnamneseResponse;
import elovia.eloviaapi.dto.DocumentoAlunoResponse;
import elovia.eloviaapi.exception.BusinessException;
import elovia.eloviaapi.exception.NotFoundException;
import elovia.eloviaapi.model.Aluno;
import elovia.eloviaapi.model.Anamnese;
import elovia.eloviaapi.model.AnamneseAnexo;
import elovia.eloviaapi.model.AnamneseDiagnostico;
import elovia.eloviaapi.model.AnamneseHistorico;
import elovia.eloviaapi.model.AnamneseMedicamento;
import elovia.eloviaapi.model.AnamneseTerapia;
import elovia.eloviaapi.model.CategoriaDocumento;
import elovia.eloviaapi.model.Role;
import elovia.eloviaapi.repository.AnamneseRepository;
import elovia.eloviaapi.repository.DocumentoAlunoRepository;

@Service
public class AnamneseService {

	private static final Set<CategoriaDocumento> CATEGORIAS_ANEXO = Set.of(
			CategoriaDocumento.LAUDO,
			CategoriaDocumento.RECEITA,
			CategoriaDocumento.RELATORIO_PEDAGOGICO,
			CategoriaDocumento.AVALIACAO,
			CategoriaDocumento.PDI,
			CategoriaDocumento.OUTRO);
	private final AnamneseRepository anamneseRepository;
	private final DocumentoAlunoRepository documentoRepository;
	private final AlunoService alunoService;
	private final DocumentoAlunoService documentoService;
	private final AnamneseDocxService docxService;
	private final CurrentUserService currentUserService;

	public AnamneseService(
			AnamneseRepository anamneseRepository,
			DocumentoAlunoRepository documentoRepository,
			AlunoService alunoService,
			DocumentoAlunoService documentoService,
			AnamneseDocxService docxService,
			CurrentUserService currentUserService) {
		this.anamneseRepository = anamneseRepository;
		this.documentoRepository = documentoRepository;
		this.alunoService = alunoService;
		this.documentoService = documentoService;
		this.docxService = docxService;
		this.currentUserService = currentUserService;
	}

	@Transactional
	public AnamneseResponse buscar(UUID alunoId) {
		var aluno = alunoService.findEntityById(alunoId);
		var usuario = currentUserService.getCurrentUser();
		var anamnese = anamneseRepository.findByAlunoId(alunoId).orElseGet(() -> {
			if (usuario.getRole() != Role.ADMIN) {
				throw new NotFoundException("A anamnese deste aluno ainda nao foi preenchida");
			}
			return criar(aluno);
		});
		return AnamneseResponse.from(anamnese);
	}

	@Transactional
	public AnamneseResponse salvarEtapa(UUID alunoId, int etapa, AnamneseRequest request) {
		if (etapa < 1 || etapa > 6) throw new BusinessException("Etapa da anamnese invalida");
		var usuario = exigirAdministrador();
		var aluno = alunoService.findEntityById(alunoId);
		var anamnese = anamneseRepository.findByAlunoId(alunoId).orElseGet(() -> criar(aluno));

		aplicarEtapa(anamnese, etapa, request);
		anamnese.setEtapaAtual(Math.max(anamnese.getEtapaAtual(), Math.min(6, etapa + 1)));
		anamnese.setPercentualPreenchimento(calcularPercentual(anamnese));
		anamnese.setAtualizadoPor(usuario);
		registrarHistorico(anamnese, etapa, usuario.getNome());
		return AnamneseResponse.from(anamneseRepository.save(anamnese));
	}

	@Transactional(readOnly = true)
	public List<AnamnesePesquisaResponse> pesquisar(UUID alunoId, String termo) {
		alunoService.findEntityById(alunoId);
		var anamnese = anamneseRepository.findByAlunoId(alunoId)
				.orElseThrow(() -> new NotFoundException("Anamnese nao encontrada"));
		var itens = camposPesquisaveis(anamnese);
		if (termo == null || termo.isBlank()) return itens;
		var busca = termo.toLowerCase(Locale.ROOT).trim();
		return itens.stream()
				.filter(item -> item.campo().toLowerCase(Locale.ROOT).contains(busca)
						|| item.valor().toLowerCase(Locale.ROOT).contains(busca)
						|| item.secao().toLowerCase(Locale.ROOT).contains(busca))
				.toList();
	}

	@Transactional(readOnly = true)
	public List<AnamneseHistoricoResponse> historico(UUID alunoId) {
		alunoService.findEntityById(alunoId);
		var anamnese = anamneseRepository.findByAlunoId(alunoId)
				.orElseThrow(() -> new NotFoundException("Anamnese nao encontrada"));
		return anamnese.getHistorico().stream()
				.map(item -> new AnamneseHistoricoResponse(
						item.getId(), item.getEtapa(), item.getResumo(),
						item.getUsuario() != null ? item.getUsuario().getNome() : null,
						item.getEditadoEm()))
				.toList();
	}

	@Transactional
	public DocumentoAlunoResponse anexar(
			UUID alunoId,
			String titulo,
			String descricao,
			CategoriaDocumento categoria,
			LocalDate dataDocumento,
			MultipartFile arquivo) {
		exigirAdministrador();
		if (!CATEGORIAS_ANEXO.contains(categoria)) {
			throw new BusinessException("Categoria de anexo invalida para a anamnese");
		}
		var anamnese = obterOuCriar(alunoId);
		var response = documentoService.criar(alunoId, titulo, descricao, categoria, dataDocumento, arquivo);
		var documento = documentoRepository.findById(response.id())
				.orElseThrow(() -> new NotFoundException("Documento nao encontrado"));
		var anexo = new AnamneseAnexo();
		anexo.setDocumento(documento);
		anamnese.addAnexo(anexo);
		return response;
	}

	@Transactional
	public DocumentoAlunoResponse gerarRelatorio(UUID alunoId) {
		alunoService.findEntityById(alunoId);
		var anamnese = anamneseRepository.findByAlunoId(alunoId)
				.orElseThrow(() -> new NotFoundException("Preencha a anamnese antes de gerar o relatorio"));
		return docxService.gerar(anamnese);
	}

	private Anamnese criar(Aluno aluno) {
		var usuario = currentUserService.getCurrentUser();
		var anamnese = new Anamnese();
		anamnese.setAluno(aluno);
		anamnese.setCriadoPor(usuario);
		anamnese.setAtualizadoPor(usuario);
		var responsavel = aluno.getResponsaveis().stream().findFirst().orElse(null);
		anamnese.setResponsavelNome(responsavel != null ? responsavel.getNome() : aluno.getResponsavel());
		anamnese.setResponsavelTelefone(responsavel != null ? responsavel.getTelefone() : aluno.getTelefoneResponsavel());
		anamnese.setInteressesPotencialidades(aluno.getInteresses());
		anamnese.setEstrategiasFuncionam(aluno.getEstrategias());
		sincronizarDiagnosticos(anamnese, aluno);
		return anamneseRepository.save(anamnese);
	}

	private Anamnese obterOuCriar(UUID alunoId) {
		var aluno = alunoService.findEntityById(alunoId);
		return anamneseRepository.findByAlunoId(alunoId).orElseGet(() -> criar(aluno));
	}

	private elovia.eloviaapi.model.Usuario exigirAdministrador() {
		var usuario = currentUserService.getCurrentUser();
		if (usuario.getRole() != Role.ADMIN) {
			throw new BusinessException("Somente o administrador pode editar a anamnese");
		}
		return usuario;
	}

	private void aplicarEtapa(Anamnese a, int etapa, AnamneseRequest r) {
		switch (etapa) {
			case 1 -> {
				a.setSerie(r.serie());
				a.setResponsavelNome(r.responsavelNome());
				a.setResponsavelParentesco(r.responsavelParentesco());
				a.setResponsavelTelefone(r.responsavelTelefone());
			}
			case 2 -> {
				a.setComQuemMora(juntar(r.comQuemMora()));
				a.setComQuemMoraOutro(r.comQuemMoraOutro());
				a.setOndeMora(r.ondeMora());
				a.setAcompanhaRotinaEscolar(r.acompanhaRotinaEscolar());
			}
			case 3 -> {
				a.setDescricaoFamilia(r.descricaoFamilia());
				a.setInteressesPotencialidades(r.interessesPotencialidades());
				a.setAtividadesPreferidas(r.atividadesPreferidas());
				a.setDificuldadeImportante(r.dificuldadeImportante());
				a.setOrientacaoEscola(r.orientacaoEscola());
			}
			case 4 -> {
				sincronizarDiagnosticos(a, r);
				a.setUsaMedicacao(r.usaMedicacao());
				sincronizarMedicamentos(a, r);
				sincronizarTerapias(a, r);
				a.setTerapiaOutra(r.terapiaOutra());
				a.setAlergias(r.alergias());
				a.setRestricoesAlimentares(r.restricoesAlimentares());
			}
			case 5 -> {
				a.setComunicacaoTipo(r.comunicacaoTipo());
				a.setComunicacaoOutra(r.comunicacaoOutra());
				a.setComoPedeAjuda(r.comoPedeAjuda());
			}
			case 6 -> {
				a.setAdaptacaoEscolar(r.adaptacaoEscolar());
				a.setEstrategiasFuncionam(r.estrategiasFuncionam());
				a.setRecomendacaoProfessorAnterior(r.recomendacaoProfessorAnterior());
				a.setObservacoesGerais(r.observacoesGerais());
			}
			default -> throw new BusinessException("Etapa da anamnese invalida");
		}
	}

	private void sincronizarMedicamentos(Anamnese a, AnamneseRequest r) {
		a.getMedicamentos().clear();
		if (!Boolean.TRUE.equals(r.usaMedicacao()) || r.medicamentos() == null) return;
		for (int ordem = 0; ordem < r.medicamentos().size(); ordem++) {
			var item = r.medicamentos().get(ordem);
			if (item.nome() == null || item.nome().isBlank()) continue;
			var medicamento = new AnamneseMedicamento();
			medicamento.setNome(item.nome().trim());
			medicamento.setDosagem(item.dosagem());
			medicamento.setHorario(null);
			medicamento.setObservacoes(item.observacao());
			medicamento.setOrdem(ordem);
			a.addMedicamento(medicamento);
		}
	}

	private void sincronizarTerapias(Anamnese a, AnamneseRequest r) {
		a.getTerapias().clear();
		if (r.terapias() == null) return;
		for (int ordem = 0; ordem < r.terapias().size(); ordem++) {
			var item = r.terapias().get(ordem);
			if (item == null || item.isBlank() || item.equals("Outros")) continue;
			var terapia = new AnamneseTerapia();
			terapia.setTipo(item.trim());
			terapia.setOrdem(ordem);
			a.addTerapia(terapia);
		}
	}

	private void sincronizarDiagnosticos(Anamnese a, AnamneseRequest r) {
		if (r.diagnosticos() == null) return;
		a.getDiagnosticos().clear();
		for (int ordem = 0; ordem < r.diagnosticos().size(); ordem++) {
			var item = r.diagnosticos().get(ordem);
			if (item.nome() == null || item.nome().isBlank()) continue;
			var diagnostico = new AnamneseDiagnostico();
			diagnostico.setComprometimento(item.nome().trim());
			diagnostico.setCid(item.cid() == null ? null : item.cid().trim());
			diagnostico.setEmInvestigacao(false);
			diagnostico.setOrdem(ordem);
			a.addDiagnostico(diagnostico);
		}
	}

	private void sincronizarDiagnosticos(Anamnese a, Aluno aluno) {
		a.getDiagnosticos().clear();
		for (int ordem = 0; ordem < aluno.getComprometimentos().size(); ordem++) {
			var origem = aluno.getComprometimentos().get(ordem);
			var destino = new AnamneseDiagnostico();
			destino.setComprometimento(origem.getNome());
			destino.setCid(origem.getCid());
			destino.setEmInvestigacao(false);
			destino.setOrdem(ordem);
			a.addDiagnostico(destino);
		}
		if (aluno.isEmInvestigacao()) {
			var investigacao = new AnamneseDiagnostico();
			investigacao.setComprometimento("Em investigacao");
			investigacao.setEmInvestigacao(true);
			investigacao.setOrdem(a.getDiagnosticos().size());
			a.addDiagnostico(investigacao);
		}
	}

	private void registrarHistorico(Anamnese a, int etapa, String usuario) {
		var item = new AnamneseHistorico();
		item.setEtapa(etapa);
		item.setResumo("Etapa " + etapa + " salva por " + usuario + " (" + a.getPercentualPreenchimento() + "% preenchido)");
		item.setUsuario(currentUserService.getCurrentUser());
		a.addHistorico(item);
	}

	private int calcularPercentual(Anamnese a) {
		int preenchidos = 0;
		int total = 23;
		Object[] campos = {
			a.getSerie(), a.getResponsavelNome(), a.getResponsavelParentesco(), a.getResponsavelTelefone(),
			a.getComQuemMora(), a.getOndeMora(), a.getAcompanhaRotinaEscolar(),
			a.getDescricaoFamilia(), a.getInteressesPotencialidades(), a.getAtividadesPreferidas(),
			a.getDificuldadeImportante(), a.getOrientacaoEscola(), a.getUsaMedicacao(),
			a.getAlergias(), a.getRestricoesAlimentares(), a.getComunicacaoTipo(), a.getComoPedeAjuda(),
			a.getAdaptacaoEscolar(), a.getEstrategiasFuncionam(), a.getRecomendacaoProfessorAnterior(),
			a.getObservacoesGerais()
		};
		for (Object campo : campos) if (preenchido(campo)) preenchidos++;
		if (!a.getDiagnosticos().isEmpty()) preenchidos++;
		if (!a.getMedicamentos().isEmpty() || !a.getTerapias().isEmpty()) preenchidos++;
		return Math.min(100, Math.round(preenchidos * 100f / total));
	}

	private boolean preenchido(Object value) {
		return value != null && (!(value instanceof String texto) || !texto.isBlank());
	}

	private String juntar(List<String> valores) {
		if (valores == null) return null;
		return valores.stream().filter(v -> v != null && !v.isBlank()).map(String::trim)
				.reduce((anterior, atual) -> anterior + "\n" + atual).orElse(null);
	}

	private List<AnamnesePesquisaResponse> camposPesquisaveis(Anamnese a) {
		var itens = new ArrayList<AnamnesePesquisaResponse>();
		adicionarCampo(itens, "Identificacao", "Serie", a.getSerie());
		adicionarCampo(itens, "Identificacao", "Responsavel", a.getResponsavelNome());
		adicionarCampo(itens, "Informacoes familiares", "Onde mora", a.getOndeMora());
		adicionarCampo(itens, "Informacoes familiares", "Com quem mora", a.getComQuemMora());
		adicionarCampo(itens, "Informacoes familiares", "Acompanha a rotina escolar", a.getAcompanhaRotinaEscolar());
		adicionarCampo(itens, "Informacoes gerais", "Descricao da familia", a.getDescricaoFamilia());
		adicionarCampo(itens, "Informacoes gerais", "Interesses e potencialidades", a.getInteressesPotencialidades());
		adicionarCampo(itens, "Informacoes gerais", "Atividades preferidas", a.getAtividadesPreferidas());
		adicionarCampo(itens, "Informacoes gerais", "Dificuldade importante", a.getDificuldadeImportante());
		adicionarCampo(itens, "Informacoes gerais", "Orientacao para a escola", a.getOrientacaoEscola());
		a.getDiagnosticos().forEach(d -> adicionarCampo(itens, "Saude", d.getComprometimento(), d.getCid()));
		adicionarCampo(itens, "Saude", "Alergias", a.getAlergias());
		adicionarCampo(itens, "Saude", "Restricoes alimentares", a.getRestricoesAlimentares());
		a.getMedicamentos().forEach(m -> adicionarCampo(itens, "Saude", "Medicamento: " + m.getNome(), combinar(m.getDosagem(), m.getObservacoes())));
		a.getTerapias().forEach(t -> adicionarCampo(itens, "Saude", "Terapia", t.getTipo()));
		adicionarCampo(itens, "Comunicacao", "Forma de comunicacao", a.getComunicacaoTipo());
		adicionarCampo(itens, "Comunicacao", "Como pede ajuda", a.getComoPedeAjuda());
		adicionarCampo(itens, "Escola", "Adaptacao escolar", a.getAdaptacaoEscolar());
		adicionarCampo(itens, "Escola", "Estrategias que funcionam", a.getEstrategiasFuncionam());
		adicionarCampo(itens, "Escola", "Recomendacao anterior", a.getRecomendacaoProfessorAnterior());
		adicionarCampo(itens, "Escola", "Observacoes gerais", a.getObservacoesGerais());
		return itens;
	}

	private void adicionarCampo(List<AnamnesePesquisaResponse> itens, String secao, String campo, String valor) {
		if (valor != null && !valor.isBlank()) itens.add(new AnamnesePesquisaResponse(secao, campo, valor));
	}

	private String combinar(String primeiro, String segundo) {
		if (primeiro == null || primeiro.isBlank()) return segundo;
		if (segundo == null || segundo.isBlank()) return primeiro;
		return primeiro + " - " + segundo;
	}
}
