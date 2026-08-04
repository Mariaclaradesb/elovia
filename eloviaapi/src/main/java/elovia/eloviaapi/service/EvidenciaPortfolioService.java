package elovia.eloviaapi.service;

import java.time.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import elovia.eloviaapi.dto.EvidenciaPortfolioResponse;
import elovia.eloviaapi.exception.BusinessException;
import elovia.eloviaapi.exception.NotFoundException;
import elovia.eloviaapi.model.*;
import elovia.eloviaapi.repository.EvidenciaPortfolioRepository;

@Service
public class EvidenciaPortfolioService {
	private static final Set<String> IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
	private static final long MAX_IMAGE_SIZE = 12L * 1024 * 1024;
	private static final Duration LINK_DURATION = Duration.ofHours(1);
	private final EvidenciaPortfolioRepository repository;
	private final AlunoService alunoService;
	private final CurrentUserService currentUserService;
	private final SupabaseStorageService storageService;

	public EvidenciaPortfolioService(EvidenciaPortfolioRepository repository, AlunoService alunoService,
			CurrentUserService currentUserService, SupabaseStorageService storageService) {
		this.repository = repository;
		this.alunoService = alunoService;
		this.currentUserService = currentUserService;
		this.storageService = storageService;
	}

	@Transactional(readOnly = true)
	public List<EvidenciaPortfolioResponse> list(UUID alunoId) {
		alunoService.findEntityById(alunoId);
		return repository.findByAlunoIdAndAtivoTrueOrderByRegistradoEmDesc(alunoId).stream().map(this::response).toList();
	}

	@Transactional(readOnly = true)
	public EvidenciaPortfolioResponse find(UUID id) { return response(findAuthorized(id)); }

	@Transactional
	public EvidenciaPortfolioResponse create(UUID alunoId, String disciplina, String titulo,
			TipoAtividadePortfolio tipo, StatusAtividadePortfolio status, String descricao,
			String observacoes, String tags, LocalDate data, LocalTime horario, MultipartFile foto) {
		var user = currentUserService.getCurrentUser();
		if (user.getRole() != Role.MEDIADOR) throw new BusinessException("Somente mediadores podem cadastrar evidencias");
		var evidence = new EvidenciaPortfolio();
		evidence.setAluno(alunoService.findEntityById(alunoId));
		evidence.setMediador(user);
		evidence.setCadastradoPor(user);
		fill(evidence, disciplina, titulo, tipo, status, descricao, observacoes, tags, data, horario);
		storePhoto(evidence, foto, true);
		return response(repository.save(evidence));
	}

	@Transactional
	public EvidenciaPortfolioResponse update(UUID id, String disciplina, String titulo,
			TipoAtividadePortfolio tipo, StatusAtividadePortfolio status, String descricao,
			String observacoes, String tags, LocalDate data, LocalTime horario, MultipartFile foto) {
		var evidence = findAuthorized(id);
		ensureOwner(evidence);
		fill(evidence, disciplina, titulo, tipo, status, descricao, observacoes, tags, data, horario);
		storePhoto(evidence, foto, false);
		evidence.setUsuarioUltimaEdicao(currentUserService.getCurrentUser());
		return response(evidence);
	}

	@Transactional
	public void delete(UUID id) {
		var evidence = findAuthorized(id);
		ensureOwner(evidence);
		evidence.setAtivo(false);
		evidence.setUsuarioUltimaEdicao(currentUserService.getCurrentUser());
	}

	private EvidenciaPortfolio findAuthorized(UUID id) {
		var evidence = repository.findById(id).filter(EvidenciaPortfolio::isAtivo)
				.orElseThrow(() -> new NotFoundException("Evidencia nao encontrada"));
		alunoService.findEntityById(evidence.getAluno().getId());
		return evidence;
	}

	private void ensureOwner(EvidenciaPortfolio evidence) {
		var user = currentUserService.getCurrentUser();
		if (user.getRole() != Role.MEDIADOR || !evidence.getMediador().getId().equals(user.getId())) {
			throw new BusinessException("Apenas o mediador responsavel pode alterar esta evidencia");
		}
	}

	private void fill(EvidenciaPortfolio evidence, String disciplina, String titulo,
			TipoAtividadePortfolio tipo, StatusAtividadePortfolio status, String descricao,
			String observacoes, String tags, LocalDate data, LocalTime horario) {
		if (disciplina == null || disciplina.isBlank()) throw new BusinessException("Informe a disciplina");
		evidence.setDisciplina(disciplina.trim());
		evidence.setTitulo(optional(titulo));
		evidence.setDescricao(optional(descricao));
		evidence.setObservacoesComplementares(optional(observacoes));
		evidence.setTipoAtividade(tipo != null ? tipo : TipoAtividadePortfolio.OUTRO);
		evidence.setStatusAtividade(status != null ? status : StatusAtividadePortfolio.CONCLUIDA);
		evidence.setData(data != null ? data : LocalDate.now());
		evidence.setHorario(horario != null ? horario : LocalTime.now());
		evidence.setRegistradoEm(evidence.getData().atTime(evidence.getHorario()).atZone(ZoneId.systemDefault()).toInstant());
		evidence.getTags().clear();
		if (tags != null) Arrays.stream(tags.split(",")).map(String::trim).filter(v -> !v.isBlank())
				.map(v -> v.substring(0, Math.min(v.length(), 60))).limit(12).forEach(evidence.getTags()::add);
	}

	private void storePhoto(EvidenciaPortfolio evidence, MultipartFile photo, boolean required) {
		if (photo == null || photo.isEmpty()) {
			if (required) throw new BusinessException("Fotografe a atividade antes de salvar");
			return;
		}
		if (photo.getSize() > MAX_IMAGE_SIZE || !IMAGE_TYPES.contains(photo.getContentType())) {
			throw new BusinessException("Envie uma imagem JPG, PNG ou WEBP de ate 12 MB");
		}
		var original = photo.getOriginalFilename() != null ? photo.getOriginalFilename() : "evidencia.jpg";
		var safe = original.replaceAll("[^a-zA-Z0-9._-]", "_");
		var path = "alunos/" + evidence.getAluno().getId() + "/portfolio/" + UUID.randomUUID() + "-" + safe;
		storageService.upload(path, photo);
		evidence.setFotoCaminho(path);
		evidence.setFotoNome(original);
		evidence.setFotoTipo(photo.getContentType());
	}

	private EvidenciaPortfolioResponse response(EvidenciaPortfolio e) {
		return new EvidenciaPortfolioResponse(e.getId(), e.getAluno().getId(), e.getAluno().getNome(),
			e.getMediador().getId(), e.getMediador().getNome(), e.getCadastradoPor().getId(),
			e.getCadastradoPor().getNome(), e.getDisciplina(), e.getTitulo(), e.getTipoAtividade(),
			e.getStatusAtividade(), e.getDescricao(), e.getObservacoesComplementares(),
			storageService.signedUrl(e.getFotoCaminho(), LINK_DURATION), e.getData(), e.getHorario(),
			e.getRegistradoEm(), e.getCriadoEm(), e.getAtualizadoEm(), Set.copyOf(e.getTags()));
	}

	private String optional(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
