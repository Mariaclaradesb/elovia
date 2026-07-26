package elovia.eloviaapi.service;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import elovia.eloviaapi.dto.MediadorRequest;
import elovia.eloviaapi.dto.MediadorResponse;
import elovia.eloviaapi.exception.BusinessException;
import elovia.eloviaapi.exception.NotFoundException;
import elovia.eloviaapi.model.Role;
import elovia.eloviaapi.model.Usuario;
import elovia.eloviaapi.repository.UsuarioRepository;

@Service
public class MediadorService {

	private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

	private final UsuarioRepository usuarioRepository;
	private final PasswordEncoder passwordEncoder;
	private final NotificationService notificationService;
	private final SecureRandom secureRandom = new SecureRandom();

	public MediadorService(
			UsuarioRepository usuarioRepository,
			PasswordEncoder passwordEncoder,
			NotificationService notificationService) {
		this.usuarioRepository = usuarioRepository;
		this.passwordEncoder = passwordEncoder;
		this.notificationService = notificationService;
	}

	public List<MediadorResponse> findAll() {
		return usuarioRepository.findByRoleAndAtivoTrueOrderByNomeAsc(Role.MEDIADOR).stream()
				.map(MediadorResponse::from)
				.toList();
	}

	public MediadorResponse findById(UUID id) {
		return MediadorResponse.from(findMediador(id));
	}

	@Transactional
	public MediadorResponse create(MediadorRequest request) {
		validateUnique(request.email(), request.cpf(), null);
		var temporaryPassword = generateTemporaryPassword();
		var mediador = new Usuario();
		fillMediador(mediador, request);
		mediador.setRole(Role.MEDIADOR);
		mediador.setPrimeiroAcesso(true);
		mediador.setAtivo(true);
		mediador.setSenha(passwordEncoder.encode(temporaryPassword));
		var saved = usuarioRepository.save(mediador);
		notificationService.sendTemporaryPassword(saved, temporaryPassword);
		return MediadorResponse.from(saved, temporaryPassword);
	}

	@Transactional
	public MediadorResponse update(UUID id, MediadorRequest request) {
		var mediador = findMediador(id);
		validateUnique(request.email(), request.cpf(), id);
		fillMediador(mediador, request);
		return MediadorResponse.from(mediador);
	}

	@Transactional
	public void deactivate(UUID id) {
		var mediador = findMediador(id);
		mediador.setAtivo(false);
	}

	@Transactional
	public MediadorResponse resetPassword(UUID id) {
		var mediador = findMediador(id);
		var temporaryPassword = generateTemporaryPassword();
		mediador.setSenha(passwordEncoder.encode(temporaryPassword));
		mediador.setPrimeiroAcesso(true);
		notificationService.sendTemporaryPassword(mediador, temporaryPassword);
		return MediadorResponse.from(mediador, temporaryPassword);
	}

	private Usuario findMediador(UUID id) {
		return usuarioRepository.findById(id)
				.filter(usuario -> usuario.getRole() == Role.MEDIADOR)
				.orElseThrow(() -> new NotFoundException("Mediador nao encontrado"));
	}

	private void validateUnique(String email, String cpf, UUID currentId) {
		usuarioRepository.findByEmailIgnoreCase(email)
				.filter(usuario -> !usuario.getId().equals(currentId))
				.ifPresent(usuario -> {
					throw new BusinessException("Ja existe usuario com este email");
				});
		usuarioRepository.findByCpf(cpf).stream()
				.filter(usuario -> !usuario.getId().equals(currentId))
				.findFirst()
				.ifPresent(usuario -> {
					throw new BusinessException("Ja existe usuario com este CPF");
				});
	}

	private void fillMediador(Usuario mediador, MediadorRequest request) {
		mediador.setNome(request.nome());
		mediador.setCpf(request.cpf());
		mediador.setEmail(request.email());
		mediador.setTelefone(request.telefone());
		mediador.setEscola(request.escola());
		mediador.setCargo(request.cargo());
		mediador.setMatricula(request.matricula());
	}

	private String generateTemporaryPassword() {
		var builder = new StringBuilder();
		for (int i = 0; i < 10; i++) {
			builder.append(PASSWORD_CHARS.charAt(secureRandom.nextInt(PASSWORD_CHARS.length())));
		}
		return builder.toString();
	}
}
