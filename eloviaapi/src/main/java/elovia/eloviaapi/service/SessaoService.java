package elovia.eloviaapi.service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import elovia.eloviaapi.dto.AlunoSessaoResponse;
import elovia.eloviaapi.dto.SessaoRequest;
import elovia.eloviaapi.dto.SessaoResponse;
import elovia.eloviaapi.exception.BusinessException;
import elovia.eloviaapi.exception.NotFoundException;
import elovia.eloviaapi.model.Aluno;
import elovia.eloviaapi.model.Role;
import elovia.eloviaapi.model.SessaoAcompanhamento;
import elovia.eloviaapi.model.StatusSessao;
import elovia.eloviaapi.model.Usuario;
import elovia.eloviaapi.repository.ObservacaoRepository;
import elovia.eloviaapi.repository.SessaoAcompanhamentoRepository;

@Service
public class SessaoService {

	private final SessaoAcompanhamentoRepository sessaoRepository;
	private final ObservacaoRepository observacaoRepository;
	private final AlunoService alunoService;
	private final CurrentUserService currentUserService;

	public SessaoService(
			SessaoAcompanhamentoRepository sessaoRepository,
			ObservacaoRepository observacaoRepository,
			AlunoService alunoService,
			CurrentUserService currentUserService) {
		this.sessaoRepository = sessaoRepository;
		this.observacaoRepository = observacaoRepository;
		this.alunoService = alunoService;
		this.currentUserService = currentUserService;
	}

	@Transactional(readOnly = true)
	public List<SessaoResponse> findAll() {
		var usuario = currentUserService.getCurrentUser();
		var sessoes = usuario.getRole() == Role.ADMIN
				? sessaoRepository.findByMediadorAdministradorIdOrderByInicioDesc(usuario.getId())
				: sessaoRepository.findByMediadorIdOrderByInicioDesc(usuario.getId());
		return sessoes.stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public List<SessaoResponse> findByAluno(UUID alunoId) {
		alunoService.findEntityById(alunoId);
		return sessaoRepository.findByAlunosIdOrderByInicioDesc(alunoId).stream()
				.filter(this::canAccess)
				.map(this::toResponse)
				.toList();
	}

	@Transactional
	public SessaoResponse create(SessaoRequest request) {
		var usuario = currentUserService.getCurrentUser();
		if (usuario.getRole() != Role.MEDIADOR) {
			throw new BusinessException("Apenas mediadores podem iniciar acompanhamento");
		}

		sessaoRepository.findFirstByMediadorIdAndStatusOrderByInicioDesc(usuario.getId(), StatusSessao.ABERTA)
				.ifPresent(sessao -> {
					throw new BusinessException("Ja existe uma sessao ativa para este mediador");
				});

		var alunoIds = request.alunoIds() != null && !request.alunoIds().isEmpty()
				? request.alunoIds()
				: request.alunoId() != null ? List.of(request.alunoId()) : List.<UUID>of();
		if (alunoIds.isEmpty()) {
			throw new BusinessException("Selecione ao menos um aluno");
		}

		var sessao = new SessaoAcompanhamento();
		sessao.setMediador(usuario);
		sessao.setPeriodo(request.periodo());
		sessao.setData(request.data() != null ? request.data() : LocalDate.now());
		sessao.setInicio(Instant.now());
		sessao.setObservacoes(request.observacoes());
		for (UUID alunoId : alunoIds) {
			var aluno = alunoService.findEntityById(alunoId);
			sessao.getAlunos().add(aluno);
			if (sessao.getAluno() == null) {
				sessao.setAluno(aluno);
			}
		}
		return toResponse(sessaoRepository.save(sessao));
	}

	@Transactional
	public SessaoResponse finish(UUID id) {
		var sessao = findEntityById(id);
		sessao.setStatus(StatusSessao.FINALIZADA);
		sessao.setFim(Instant.now());
		return toResponse(sessao);
	}

	@Transactional(readOnly = true)
	public SessaoResponse findAtiva() {
		var usuario = currentUserService.getCurrentUser();
		if (usuario.getRole() != Role.MEDIADOR) {
			throw new NotFoundException("Sessao ativa não encontrada");
		}
		return sessaoRepository.findFirstByMediadorIdAndStatusOrderByInicioDesc(usuario.getId(), StatusSessao.ABERTA)
				.map(this::toResponse)
				.orElseThrow(() -> new NotFoundException("Sessao ativa não encontrada"));
	}

	@Transactional(readOnly = true)
	public SessaoResponse findById(UUID id) {
		return toResponse(findEntityById(id));
	}

	SessaoAcompanhamento findEntityById(UUID id) {
		return sessaoRepository.findById(id)
				.filter(this::canAccess)
				.orElseThrow(() -> new NotFoundException("Sessao não encontrada"));
	}

	boolean alunoPertenceASessao(SessaoAcompanhamento sessao, UUID alunoId) {
		return sessao.getAlunos().stream().anyMatch(aluno -> aluno.getId().equals(alunoId));
	}

	private boolean canAccess(SessaoAcompanhamento sessao) {
		var usuario = currentUserService.getCurrentUser();
		if (usuario.getRole() == Role.ADMIN) {
			return sessao.getMediador() != null
					&& sessao.getMediador().getAdministrador() != null
					&& sessao.getMediador().getAdministrador().getId().equals(usuario.getId());
		}
		return sessao.getMediador() != null && sessao.getMediador().getId().equals(usuario.getId());
	}

	private SessaoResponse toResponse(SessaoAcompanhamento sessao) {
		var alunos = sessao.getAlunos().stream()
				.map(aluno -> AlunoSessaoResponse.from(aluno, observacaoRepository.countBySessaoIdAndAlunoId(sessao.getId(), aluno.getId())))
				.toList();
		return SessaoResponse.from(sessao, alunos);
	}
}
