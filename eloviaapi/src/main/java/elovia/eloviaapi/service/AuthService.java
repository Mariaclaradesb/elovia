package elovia.eloviaapi.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import elovia.eloviaapi.dto.AlterarSenhaRequest;
import elovia.eloviaapi.dto.AtualizarPerfilRequest;
import elovia.eloviaapi.dto.CadastrarAdminRequest;
import elovia.eloviaapi.dto.EsqueciSenhaRequest;
import elovia.eloviaapi.dto.LoginRequest;
import elovia.eloviaapi.dto.LoginResponse;
import elovia.eloviaapi.dto.RedefinirSenhaRequest;
import elovia.eloviaapi.dto.UsuarioResponse;
import elovia.eloviaapi.exception.BusinessException;
import elovia.eloviaapi.model.Usuario;
import elovia.eloviaapi.model.Role;
import elovia.eloviaapi.repository.UsuarioRepository;
import elovia.eloviaapi.security.JwtService;

@Service
public class AuthService {

	private final UsuarioRepository usuarioRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final CurrentUserService currentUserService;

	public AuthService(
			UsuarioRepository usuarioRepository,
			PasswordEncoder passwordEncoder,
			JwtService jwtService,
			CurrentUserService currentUserService) {
		this.usuarioRepository = usuarioRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.currentUserService = currentUserService;
	}

	@Transactional
	public LoginResponse login(LoginRequest request) {
		var usuario = usuarioRepository.findByEmailIgnoreCase(request.email())
				.filter(Usuario::isAtivo)
				.orElseThrow(() -> new BadCredentialsException("Credenciais invalidas"));

		if (!passwordEncoder.matches(request.senha(), usuario.getSenha())) {
			throw new BadCredentialsException("Credenciais invalidas");
		}

		usuario.setUltimoLogin(Instant.now());
		return new LoginResponse(jwtService.generate(usuario), UsuarioResponse.from(usuario));
	}

	@Transactional
	public LoginResponse cadastrarAdmin(CadastrarAdminRequest request) {
		if (!request.senha().equals(request.confirmarSenha())) {
			throw new BusinessException("A confirmacao da senha não confere");
		}

		if (usuarioRepository.existsByEmailIgnoreCase(request.email())) {
			throw new BusinessException("Email ja cadastrado");
		}

		if (usuarioRepository.existsByCpf(request.cpf())) {
			throw new BusinessException("CPF ja cadastrado");
		}

		var usuario = new Usuario();
		usuario.setNome(request.nome());
		usuario.setCpf(request.cpf());
		usuario.setEmail(request.email());
		usuario.setTelefone(request.telefone());
		usuario.setEscola(request.escola());
		usuario.setCargo("Administrador");
		usuario.setSenha(passwordEncoder.encode(request.senha()));
		usuario.setRole(Role.ADMIN);
		usuario.setPrimeiroAcesso(false);
		usuario.setAtivo(true);
		usuario.setUltimoLogin(Instant.now());

		var salvo = usuarioRepository.save(usuario);
		return new LoginResponse(jwtService.generate(salvo), UsuarioResponse.from(salvo));
	}

	public UsuarioResponse me() {
		return UsuarioResponse.from(currentUserService.getCurrentUser());
	}

	@Transactional
	public UsuarioResponse atualizarPerfil(AtualizarPerfilRequest request) {
		var usuario = currentUserService.getCurrentUser();

		usuarioRepository.findByEmailIgnoreCase(request.email())
				.filter(outro -> !outro.getId().equals(usuario.getId()))
				.ifPresent(outro -> {
					throw new BusinessException("Email ja cadastrado");
				});

		usuarioRepository.findByCpf(request.cpf())
				.filter(outro -> !outro.getId().equals(usuario.getId()))
				.ifPresent(outro -> {
					throw new BusinessException("CPF ja cadastrado");
				});

		usuario.setNome(request.nome());
		usuario.setCpf(request.cpf());
		usuario.setEmail(request.email());
		usuario.setTelefone(request.telefone());
		usuario.setEscola(request.escola());
		usuario.setCargo(request.cargo());
		usuario.setMatricula(request.matricula());
		return UsuarioResponse.from(usuario);
	}

	@Transactional
	public UsuarioResponse alterarSenha(AlterarSenhaRequest request) {
		if (!request.novaSenha().equals(request.confirmarSenha())) {
			throw new BusinessException("A confirmacao da senha não confere");
		}

		var usuario = currentUserService.getCurrentUser();
		if (!usuario.isPrimeiroAcesso()
				&& (request.senhaAtual() == null || !passwordEncoder.matches(request.senhaAtual(), usuario.getSenha()))) {
			throw new BadCredentialsException("Senha atual invalida");
		}

		usuario.setSenha(passwordEncoder.encode(request.novaSenha()));
		usuario.setPrimeiroAcesso(false);
		return UsuarioResponse.from(usuario);
	}

	public void esqueciSenha(EsqueciSenhaRequest request) {
		usuarioRepository.findByEmailIgnoreCase(request.email())
				.ifPresent(usuario -> {
					var token = UUID.randomUUID().toString();
					// TODO: persistir token e enviar por SMTP quando a configuracao de e-mail existir.
				});
	}

	public void redefinirSenha(RedefinirSenhaRequest request) {
		if (!request.novaSenha().equals(request.confirmarSenha())) {
			throw new BusinessException("A confirmacao da senha não confere");
		}
		throw new BusinessException("Recuperacao de senha ainda depende da configuracao de envio de e-mail");
	}
}
