package elovia.eloviaapi.service;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import elovia.eloviaapi.dto.AlunoObservacoesRequest;
import elovia.eloviaapi.dto.AlunoRequest;
import elovia.eloviaapi.dto.AlunoResponse;
import elovia.eloviaapi.dto.AssociarMediadoresRequest;
import elovia.eloviaapi.dto.ResponsavelAlunoRequest;
import elovia.eloviaapi.exception.BusinessException;
import elovia.eloviaapi.exception.NotFoundException;
import elovia.eloviaapi.model.Aluno;
import elovia.eloviaapi.model.Role;
import elovia.eloviaapi.model.Usuario;
import elovia.eloviaapi.repository.AlunoRepository;
import elovia.eloviaapi.repository.UsuarioRepository;

@Service
public class AlunoService {

	private final AlunoRepository alunoRepository;
	private final UsuarioRepository usuarioRepository;
	private final CurrentUserService currentUserService;

	public AlunoService(
			AlunoRepository alunoRepository,
			UsuarioRepository usuarioRepository,
			CurrentUserService currentUserService) {
		this.alunoRepository = alunoRepository;
		this.usuarioRepository = usuarioRepository;
		this.currentUserService = currentUserService;
	}

	@Transactional(readOnly = true)
	public List<AlunoResponse> findAll() {
		var usuario = currentUserService.getCurrentUser();
		var alunos = usuario.getRole() == Role.ADMIN
				? alunoRepository.findByAdministradorIdOrderByNomeAsc(usuario.getId())
				: alunoRepository.findByAtivoTrueAndMediadoresIdOrderByNomeAsc(usuario.getId());
		return alunos.stream()
				.map(AlunoResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public AlunoResponse findById(UUID id) {
		return AlunoResponse.from(findEntityById(id));
	}

	@Transactional
	public AlunoResponse create(AlunoRequest request) {
		var aluno = new Aluno();
		aluno.setAdministrador(currentUserService.getCurrentUser());
		fillAluno(aluno, request);
		var savedAluno = alunoRepository.save(aluno);
		syncMediadores(savedAluno, request.mediadorIds());
		return AlunoResponse.from(savedAluno);
	}

	@Transactional
	public AlunoResponse update(UUID id, AlunoRequest request) {
		var aluno = findEntityById(id);
		fillAluno(aluno, request);
		if (request.mediadorIds() != null) {
			syncMediadores(aluno, request.mediadorIds());
		}
		return AlunoResponse.from(aluno);
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
		return AlunoResponse.from(aluno);
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
		return AlunoResponse.from(aluno);
	}

	@Transactional
	public void removerMediador(UUID alunoId, UUID mediadorId) {
		var aluno = findEntityById(alunoId);
		var mediador = usuarioRepository.findById(mediadorId)
				.filter(usuario -> usuario.getRole() == Role.MEDIADOR)
				.orElseThrow(() -> new NotFoundException("Mediador nao encontrado"));
		mediador.getAlunos().remove(aluno);
		aluno.getMediadores().remove(mediador);
	}

	private void fillAluno(Aluno aluno, AlunoRequest request) {
		aluno.setNome(request.nome());
		aluno.setFoto(request.foto());
		aluno.setDataNascimento(request.dataNascimento());
		aluno.setSexo(request.sexo());
		aluno.setEscola(request.escola());
		aluno.setTurma(request.turma());
		aluno.setTurno(request.turno());
		fillResponsaveis(aluno, request);
		aluno.setDiagnostico(request.diagnostico());
		aluno.setCid(request.cid());
		aluno.setNecessitaMediador(request.necessitaMediador());
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
		if (responsaveis != null && !responsaveis.isEmpty()) {
			var principal = responsaveis.get(0);
			aluno.setResponsavel(principal.nome());
			aluno.setTelefoneResponsavel(principal.telefone());
			aluno.setEmailResponsavel(principal.email());
			aluno.setResponsaveis(encodeResponsaveis(responsaveis));
			return;
		}

		aluno.setResponsavel(request.responsavel());
		aluno.setTelefoneResponsavel(request.telefoneResponsavel());
		aluno.setEmailResponsavel(request.emailResponsavel());
		aluno.setResponsaveis(null);
	}

	private String encodeResponsaveis(List<ResponsavelAlunoRequest> responsaveis) {
		return responsaveis.stream()
				.map(item -> sanitizeResponsavelValue(item.nome())
						+ "\t" + sanitizeResponsavelValue(item.telefone())
						+ "\t" + sanitizeResponsavelValue(item.email()))
				.reduce((left, right) -> left + "\n" + right)
				.orElse("");
	}

	private String sanitizeResponsavelValue(String value) {
		return value == null ? "" : value.replace("\t", " ").replace("\n", " ").trim();
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
