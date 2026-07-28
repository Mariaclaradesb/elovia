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
		if (etapa < 1 || etapa > 7) throw new BusinessException("Etapa da anamnese invalida");
		var usuario = exigirAdministrador();
		var aluno = alunoService.findEntityById(alunoId);
		var anamnese = anamneseRepository.findByAlunoId(alunoId).orElseGet(() -> criar(aluno));

		aplicarEtapa(anamnese, etapa, request);
		sincronizarDiagnosticos(anamnese, aluno);
		anamnese.setEtapaAtual(Math.max(anamnese.getEtapaAtual(), Math.min(7, etapa + 1)));
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
				a.setProfessorSalaRecursos(r.professorSalaRecursos());
				a.setProfissionalApoio(r.profissionalApoio());
				a.setFuncaoProfissionalApoio(r.funcaoProfissionalApoio());
			}
			case 2 -> a.setMotivoMatriculaSrm(r.motivoMatriculaSrm());
			case 3 -> {
				a.setQuemEAluno(r.quemEAluno());
				a.setOndeMora(r.ondeMora());
				a.setComQuemMora(juntar(r.comQuemMora()));
				a.setDesenvolvimento(r.desenvolvimento());
				a.setGestacao(r.gestacao());
				a.setComplicacoesParto(r.complicacoesParto());
				a.setPossuiIrmaos(r.possuiIrmaos());
				a.setQuantidadeIrmaos(Boolean.TRUE.equals(r.possuiIrmaos()) ? r.quantidadeIrmaos() : null);
				a.setComunicacao(juntar(r.comunicacao()));
			}
			case 4 -> {
				a.setUsaMedicacao(r.usaMedicacao());
				sincronizarMedicamentos(a, r);
				sincronizarTerapias(a, r);
				a.setAlergias(r.alergias());
				a.setRestricoesAlimentares(r.restricoesAlimentares());
				a.setCrisesRecorrentes(r.crisesRecorrentes());
				a.setInformacoesMedicas(r.informacoesMedicas());
			}
			case 5 -> {
				a.setPotencialidades(r.potencialidades());
				a.setInteresses(r.interesses());
				a.setMaiorFacilidade(r.maiorFacilidade());
				a.setMaiorDificuldade(r.maiorDificuldade());
				a.setNecessitaAdaptacoes(r.necessitaAdaptacoes());
				a.setReacaoMudancas(r.reacaoMudancas());
				a.setHiperfoco(r.hiperfoco());
				a.setFormasAprendizagem(juntar(r.formasAprendizagem()));
			}
			case 6 -> {
				a.setResponsavelRespondente(r.responsavelRespondente());
				a.setRotinaCasa(r.rotinaCasa());
				a.setExpectativasFamilia(r.expectativasFamilia());
				a.setOrientacaoImportante(r.orientacaoImportante());
				a.setComportamentosForaEscola(r.comportamentosForaEscola());
			}
			case 7 -> {
				a.setObservacaoSalaOutrosEspacos(r.observacaoSalaOutrosEspacos());
				a.setProfessorRegente(r.professorRegente());
				a.setSalaRecursos(r.salaRecursos());
				a.setEquipePedagogica(r.equipePedagogica());
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
			medicamento.setHorario(item.horario());
			medicamento.setObservacoes(item.observacoes());
			medicamento.setOrdem(ordem);
			a.addMedicamento(medicamento);
		}
	}

	private void sincronizarTerapias(Anamnese a, AnamneseRequest r) {
		a.getTerapias().clear();
		if (r.terapias() == null) return;
		for (int ordem = 0; ordem < r.terapias().size(); ordem++) {
			var item = r.terapias().get(ordem);
			if (item.tipo() == null || item.tipo().isBlank()) continue;
			var terapia = new AnamneseTerapia();
			terapia.setTipo(item.tipo().trim());
			terapia.setFrequencia(item.frequencia());
			terapia.setProfissional(item.profissional());
			terapia.setObservacoes(item.observacoes());
			terapia.setOrdem(ordem);
			a.addTerapia(terapia);
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
		int total = 37;
		Object[] campos = {
			a.getProfessorSalaRecursos(), a.getProfissionalApoio(), a.getFuncaoProfissionalApoio(),
			a.getMotivoMatriculaSrm(), a.getQuemEAluno(), a.getOndeMora(), a.getComQuemMora(),
			a.getDesenvolvimento(), a.getGestacao(), a.getComplicacoesParto(), a.getPossuiIrmaos(),
			a.getComunicacao(), a.getUsaMedicacao(), a.getAlergias(), a.getRestricoesAlimentares(),
			a.getCrisesRecorrentes(), a.getInformacoesMedicas(), a.getPotencialidades(), a.getInteresses(),
			a.getMaiorFacilidade(), a.getMaiorDificuldade(), a.getNecessitaAdaptacoes(), a.getReacaoMudancas(),
			a.getHiperfoco(), a.getFormasAprendizagem(), a.getResponsavelRespondente(), a.getRotinaCasa(),
			a.getExpectativasFamilia(), a.getOrientacaoImportante(), a.getComportamentosForaEscola(),
			a.getObservacaoSalaOutrosEspacos(), a.getProfessorRegente(), a.getSalaRecursos(),
			a.getEquipePedagogica(), a.getObservacoesGerais()
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
		adicionarCampo(itens, "Identificacao", "Professor da sala de recursos", a.getProfessorSalaRecursos());
		adicionarCampo(itens, "Identificacao", "Profissional de apoio", a.getProfissionalApoio());
		adicionarCampo(itens, "Comprometimentos", "Motivo da matricula na SRM", a.getMotivoMatriculaSrm());
		a.getDiagnosticos().forEach(d -> adicionarCampo(itens, "Comprometimentos", d.getComprometimento(), d.getCid()));
		adicionarCampo(itens, "Historico", "Quem e o aluno", a.getQuemEAluno());
		adicionarCampo(itens, "Historico", "Onde mora", a.getOndeMora());
		adicionarCampo(itens, "Historico", "Com quem mora", a.getComQuemMora());
		adicionarCampo(itens, "Historico", "Desenvolvimento", a.getDesenvolvimento());
		adicionarCampo(itens, "Historico", "Gestacao", a.getGestacao());
		adicionarCampo(itens, "Saude", "Alergias", a.getAlergias());
		adicionarCampo(itens, "Saude", "Restricoes alimentares", a.getRestricoesAlimentares());
		adicionarCampo(itens, "Saude", "Crises recorrentes", a.getCrisesRecorrentes());
		adicionarCampo(itens, "Saude", "Informacoes medicas", a.getInformacoesMedicas());
		a.getMedicamentos().forEach(m -> adicionarCampo(itens, "Saude", "Medicamento: " + m.getNome(), combinar(m.getDosagem(), m.getHorario())));
		a.getTerapias().forEach(t -> adicionarCampo(itens, "Saude", "Terapia: " + t.getTipo(), combinar(t.getFrequencia(), t.getProfissional())));
		adicionarCampo(itens, "Perfil pedagogico", "Potencialidades", a.getPotencialidades());
		adicionarCampo(itens, "Perfil pedagogico", "Interesses", a.getInteresses());
		adicionarCampo(itens, "Perfil pedagogico", "Maior facilidade", a.getMaiorFacilidade());
		adicionarCampo(itens, "Perfil pedagogico", "Maior dificuldade", a.getMaiorDificuldade());
		adicionarCampo(itens, "Familia", "Rotina em casa", a.getRotinaCasa());
		adicionarCampo(itens, "Familia", "Expectativas", a.getExpectativasFamilia());
		adicionarCampo(itens, "Escola", "Professor regente", a.getProfessorRegente());
		adicionarCampo(itens, "Escola", "Sala de recursos", a.getSalaRecursos());
		adicionarCampo(itens, "Escola", "Equipe pedagogica", a.getEquipePedagogica());
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
