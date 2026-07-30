package elovia.eloviaapi.service;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import elovia.eloviaapi.dto.AlunoObservacoesRequest;
import elovia.eloviaapi.dto.AlunoRequest;
import elovia.eloviaapi.dto.AlunoResponse;
import elovia.eloviaapi.dto.AssociarMediadoresRequest;
import elovia.eloviaapi.dto.ComprometimentoAlunoRequest;
import elovia.eloviaapi.dto.ResponsavelAlunoRequest;
import elovia.eloviaapi.exception.BusinessException;
import elovia.eloviaapi.exception.NotFoundException;
import elovia.eloviaapi.model.Aluno;
import elovia.eloviaapi.model.ComprometimentoAluno;
import elovia.eloviaapi.model.ResponsavelAluno;
import elovia.eloviaapi.model.Role;
import elovia.eloviaapi.model.Usuario;
import elovia.eloviaapi.repository.AlunoRepository;
import elovia.eloviaapi.repository.UsuarioRepository;

@Service
public class AlunoService {

	private final AlunoRepository alunoRepository;
	private final UsuarioRepository usuarioRepository;
	private final CurrentUserService currentUserService;
	private final SupabaseStorageService storageService;
	private final FotoPerfilService fotoPerfilService;
	private static final Set<String> EXTENSOES_FOTO_ACEITAS = Set.of("png", "jpg", "jpeg", "webp");

	public AlunoService(
			AlunoRepository alunoRepository,
			UsuarioRepository usuarioRepository,
			CurrentUserService currentUserService,
			SupabaseStorageService storageService,
			FotoPerfilService fotoPerfilService) {
		this.alunoRepository = alunoRepository;
		this.usuarioRepository = usuarioRepository;
		this.currentUserService = currentUserService;
		this.storageService = storageService;
		this.fotoPerfilService = fotoPerfilService;
	}

	@Transactional(readOnly = true)
	public List<AlunoResponse> findAll() {
		var usuario = currentUserService.getCurrentUser();
		var alunos = usuario.getRole() == Role.ADMIN
				? alunoRepository.findByAdministradorIdOrderByNomeAsc(usuario.getId())
				: alunoRepository.findByAtivoTrueAndMediadoresIdOrderByNomeAsc(usuario.getId());
		return alunos.stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public AlunoResponse findById(UUID id) {
		return toResponse(findEntityById(id));
	}

	@Transactional
	public AlunoResponse create(AlunoRequest request) {
		var aluno = new Aluno();
		aluno.setAdministrador(currentUserService.getCurrentUser());
		fillAluno(aluno, request);
		var savedAluno = alunoRepository.save(aluno);
		syncMediadores(savedAluno, request.mediadorIds());
		atualizarNecessidadeMediador(savedAluno);
		return toResponse(savedAluno);
	}

	@Transactional
	public AlunoResponse update(UUID id, AlunoRequest request) {
		var aluno = findEntityById(id);
		fillAluno(aluno, request);
		if (request.mediadorIds() != null) {
			syncMediadores(aluno, request.mediadorIds());
		}
		atualizarNecessidadeMediador(aluno);
		return toResponse(aluno);
	}

	@Transactional
	public void archive(UUID id) {
		var aluno = findEntityById(id);
		aluno.setAtivo(false);
	}

	@Transactional
	public AlunoResponse updateObservacoes(UUID id, AlunoObservacoesRequest request) {
		var aluno = findEntityById(id);
		aluno.setObservacoesIniciais(request.observacoesIniciais());
		aluno.setEstrategias(request.estrategias());
		aluno.setGatilhos(request.gatilhos());
		aluno.setPreferencias(request.preferencias());
		aluno.setInteresses(request.interesses());
		aluno.setObjetivosPdi(request.objetivosPdi());
		aluno.setFormaComunicacao(request.formaComunicacao());
		aluno.setObservacoes(request.observacoes());
		return toResponse(aluno);
	}

	@Transactional
	public AlunoResponse atualizarFoto(UUID id, MultipartFile arquivo) {
		if (arquivo == null || arquivo.isEmpty()) {
			throw new BusinessException("Selecione uma foto");
		}
		if (arquivo.getContentType() == null || !arquivo.getContentType().startsWith("image/")) {
			throw new BusinessException("Envie uma imagem PNG ou JPG");
		}

		var aluno = findEntityById(id);
		var nomeOriginal = arquivo.getOriginalFilename() != null ? arquivo.getOriginalFilename() : "aluno.jpg";
		var extensao = obterExtensao(nomeOriginal);
		if (!EXTENSOES_FOTO_ACEITAS.contains(extensao)) {
			throw new BusinessException("Envie uma imagem PNG ou JPG");
		}

		var nomeLimpo = nomeOriginal.replaceAll("[^a-zA-Z0-9._-]", "_");
		var caminho = "alunos/" + aluno.getId() + "/perfil/" + UUID.randomUUID() + "-" + nomeLimpo;
		storageService.upload(caminho, arquivo);
		aluno.setFoto(caminho);
		return toResponse(aluno);
	}

	Aluno findEntityById(UUID id) {
		var usuario = currentUserService.getCurrentUser();
		return alunoRepository.findById(id)
				.filter(aluno -> usuario.getRole() == Role.ADMIN
						? aluno.getAdministrador() != null && aluno.getAdministrador().getId().equals(usuario.getId())
						: aluno.isAtivo() && aluno.getMediadores().stream().anyMatch(mediador -> mediador.getId().equals(usuario.getId())))
				.orElseThrow(() -> new NotFoundException("Aluno nao encontrado"));
	}

	@Transactional
	public AlunoResponse associarMediadores(UUID alunoId, AssociarMediadoresRequest request) {
		var aluno = findEntityById(alunoId);
		syncMediadores(aluno, request.mediadorIds());
		atualizarNecessidadeMediador(aluno);
		return toResponse(aluno);
	}

	@Transactional
	public void removerMediador(UUID alunoId, UUID mediadorId) {
		var aluno = findEntityById(alunoId);
		var mediador = usuarioRepository.findById(mediadorId)
				.filter(usuario -> usuario.getRole() == Role.MEDIADOR)
				.orElseThrow(() -> new NotFoundException("Mediador nao encontrado"));
		mediador.getAlunos().remove(aluno);
		aluno.getMediadores().remove(mediador);
		atualizarNecessidadeMediador(aluno);
	}

	private void fillAluno(Aluno aluno, AlunoRequest request) {
		aluno.setNome(request.nome());
		aluno.setFoto(normalizeFoto(request.foto()));
		aluno.setDataNascimento(request.dataNascimento());
		aluno.setSexo(request.sexo());
		aluno.setEscola(request.escola());
		aluno.setTurma(request.turma());
		aluno.setTurno(request.turno());
		fillResponsaveis(aluno, request);
		fillComprometimentos(aluno, request);
		aluno.setObservacoesIniciais(request.observacoesIniciais());
		aluno.setEstrategias(request.estrategias());
		aluno.setGatilhos(request.gatilhos());
		aluno.setPreferencias(request.preferencias());
		aluno.setInteresses(request.interesses());
		aluno.setObjetivosPdi(request.objetivosPdi());
		aluno.setFormaComunicacao(request.formaComunicacao());
		aluno.setObservacoes(request.observacoes());
	}

	private void fillResponsaveis(Aluno aluno, AlunoRequest request) {
		var responsaveis = request.responsaveis();
		if (responsaveis == null || responsaveis.isEmpty()) {
			throw new BusinessException("Informe ao menos um responsavel");
		}

		var principal = responsaveis.get(0);
		aluno.setResponsavel(principal.nome());
		aluno.setTelefoneResponsavel(principal.telefone());
		aluno.setEmailResponsavel(principal.email());
		aluno.getResponsaveis().clear();

		for (int ordem = 0; ordem < responsaveis.size(); ordem++) {
			ResponsavelAlunoRequest requestResponsavel = responsaveis.get(ordem);
			var responsavel = new ResponsavelAluno();
			responsavel.setNome(requestResponsavel.nome().trim());
			responsavel.setTelefone(requestResponsavel.telefone().trim());
			responsavel.setEmail(requestResponsavel.email() != null ? requestResponsavel.email().trim() : null);
			responsavel.setOrdem(ordem);
			aluno.addResponsavel(responsavel);
		}
	}

	private void atualizarNecessidadeMediador(Aluno aluno) {
		aluno.setNecessitaMediador(aluno.getMediadores().isEmpty());
	}

	private void fillComprometimentos(Aluno aluno, AlunoRequest request) {
		List<ComprometimentoAlunoRequest> itens = request.comprometimentos();
		if (itens == null) {
			itens = comprometimentosLegados(request.diagnostico(), request.cid());
		}

		aluno.getComprometimentos().clear();
		for (int ordem = 0; ordem < itens.size(); ordem++) {
			var requestItem = itens.get(ordem);
			var comprometimento = new ComprometimentoAluno();
			comprometimento.setNome(requestItem.nome().trim());
			comprometimento.setCid(normalizeOptional(requestItem.cid()));
			comprometimento.setOrdem(ordem);
			aluno.addComprometimento(comprometimento);
		}

		aluno.setDiagnostico(itens.stream()
				.map(ComprometimentoAlunoRequest::nome)
				.map(String::trim)
				.reduce((anterior, atual) -> anterior + "\n" + atual)
				.orElse(null));
		aluno.setCid(itens.stream()
				.map(ComprometimentoAlunoRequest::cid)
				.map(this::normalizeOptional)
				.filter(valor -> valor != null)
				.findFirst()
				.orElse(null));

		if (request.emInvestigacao() != null) {
			aluno.setEmInvestigacao(request.emInvestigacao());
		}
	}

	private List<ComprometimentoAlunoRequest> comprometimentosLegados(String diagnostico, String cid) {
		if (diagnostico == null || diagnostico.isBlank()) {
			return List.of();
		}

		var nomes = diagnostico.lines()
				.map(String::trim)
				.filter(valor -> !valor.isBlank())
				.toList();
		return java.util.stream.IntStream.range(0, nomes.size())
				.mapToObj(indice -> new ComprometimentoAlunoRequest(
						nomes.get(indice),
						indice == 0 ? normalizeOptional(cid) : null))
				.toList();
	}

	private String normalizeOptional(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}

	private String normalizeFoto(String value) {
		if (value == null || value.isBlank()) return null;
		var foto = value.trim();
		var lower = foto.toLowerCase(Locale.ROOT);
		if (lower.startsWith("file:") || lower.startsWith("content:") || lower.startsWith("blob:") || lower.startsWith("data:")) {
			return null;
		}
		return foto;
	}

	private String obterExtensao(String nomeArquivo) {
		var index = nomeArquivo.lastIndexOf('.');
		if (index < 0 || index == nomeArquivo.length() - 1) {
			return "";
		}
		return nomeArquivo.substring(index + 1).toLowerCase(Locale.ROOT);
	}

	private AlunoResponse toResponse(Aluno aluno) {
		return AlunoResponse.from(aluno, fotoPerfilService.urlAcessivel(aluno.getFoto()));
	}

	private void syncMediadores(Aluno aluno, List<UUID> mediadorIds) {
		if (mediadorIds == null) {
			return;
		}

		var currentMediadores = new HashSet<>(aluno.getMediadores());
		currentMediadores.forEach(mediador -> mediador.getAlunos().remove(aluno));
		aluno.getMediadores().clear();

		for (UUID mediadorId : mediadorIds) {
			var mediador = usuarioRepository.findById(mediadorId)
					.filter(Usuario::isAtivo)
					.filter(usuario -> usuario.getRole() == Role.MEDIADOR)
					.filter(usuario -> usuario.getAdministrador() != null
							&& aluno.getAdministrador() != null
							&& usuario.getAdministrador().getId().equals(aluno.getAdministrador().getId()))
					.orElseThrow(() -> new BusinessException("Mediador invalido para associacao"));
			mediador.getAlunos().add(aluno);
			aluno.getMediadores().add(mediador);
		}
	}
}
