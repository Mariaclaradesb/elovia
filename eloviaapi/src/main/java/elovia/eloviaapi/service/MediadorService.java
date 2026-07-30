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
	private final CurrentUserService currentUserService;
	private final FotoPerfilService fotoPerfilService;
	private final SecureRandom secureRandom = new SecureRandom();

	public MediadorService(
			UsuarioRepository usuarioRepository,
			PasswordEncoder passwordEncoder,
			NotificationService notificationService,
			CurrentUserService currentUserService,
			FotoPerfilService fotoPerfilService) {
		this.usuarioRepository = usuarioRepository;
		this.passwordEncoder = passwordEncoder;
		this.notificationService = notificationService;
		this.currentUserService = currentUserService;
		this.fotoPerfilService = fotoPerfilService;
	}

	public List<MediadorResponse> findAll() {
		var admin = currentUserService.getCurrentUser();
		return usuarioRepository.findByRoleAndAdministradorIdOrderByNomeAsc(Role.MEDIADOR, admin.getId()).stream()
				.map(this::mediadorResponse)
				.toList();
	}

	public MediadorResponse findById(UUID id) {
		return mediadorResponse(findMediador(id));
	}

	@Transactional
	public MediadorResponse create(MediadorRequest request) {
		validateUnique(request.email(), request.cpf(), null);
		var admin = currentUserService.getCurrentUser();
		var temporaryPassword = generateTemporaryPassword();
		var mediador = new Usuario();
		fillMediador(mediador, request);
		mediador.setEscola(admin.getEscola());
		mediador.setAdministrador(admin);
		mediador.setRole(Role.MEDIADOR);
		mediador.setPrimeiroAcesso(true);
		mediador.setAtivo(true);
		mediador.setSenha(passwordEncoder.encode(temporaryPassword));
		var saved = usuarioRepository.save(mediador);
		notificationService.sendTemporaryPassword(saved, temporaryPassword);
		return mediadorResponse(saved, temporaryPassword);
	}

	@Transactional
	public MediadorResponse update(UUID id, MediadorRequest request) {
		var mediador = findMediador(id);
		var admin = currentUserService.getCurrentUser();
		validateUnique(request.email(), request.cpf(), id);
		fillMediador(mediador, request);
		mediador.setEscola(admin.getEscola());
		return mediadorResponse(mediador);
	}

	@Transactional
	public void deactivate(UUID id) {
		var mediador = findMediador(id);
		mediador.setAtivo(false);
	}

	@Transactional
	public MediadorResponse resetPassword(UUID id) {
		var mediador = findMediador(id);
		if (!mediador.isPrimeiroAcesso()) {
			throw new BusinessException("A senha temporaria so pode ser gerada antes do primeiro acesso");
		}
		var temporaryPassword = generateTemporaryPassword();
		mediador.setSenha(passwordEncoder.encode(temporaryPassword));
		mediador.setPrimeiroAcesso(true);
		notificationService.sendTemporaryPassword(mediador, temporaryPassword);
		return mediadorResponse(mediador, temporaryPassword);
	}

	private MediadorResponse mediadorResponse(Usuario mediador) {
		return mediadorResponse(mediador, null);
	}

	private MediadorResponse mediadorResponse(Usuario mediador, String temporaryPassword) {
		return MediadorResponse.from(
				mediador,
				fotoPerfilService.urlAcessivel(mediador.getFoto()),
				temporaryPassword);
	}

	private Usuario findMediador(UUID id) {
		var admin = currentUserService.getCurrentUser();
		return usuarioRepository.findById(id)
				.filter(usuario -> usuario.getRole() == Role.MEDIADOR)
				.filter(usuario -> usuario.getAdministrador() != null && usuario.getAdministrador().getId().equals(admin.getId()))
				.orElseThrow(() -> new NotFoundException("Mediador não encontrado"));
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
