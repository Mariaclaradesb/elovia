package elovia.eloviaapi.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import elovia.eloviaapi.dto.AlterarSenhaRequest;
import elovia.eloviaapi.dto.EsqueciSenhaRequest;
import elovia.eloviaapi.dto.LoginRequest;
import elovia.eloviaapi.dto.LoginResponse;
import elovia.eloviaapi.dto.RedefinirSenhaRequest;
import elovia.eloviaapi.dto.UsuarioResponse;
import elovia.eloviaapi.exception.BusinessException;
import elovia.eloviaapi.model.Usuario;
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

	public UsuarioResponse me() {
		return UsuarioResponse.from(currentUserService.getCurrentUser());
	}

	@Transactional
	public UsuarioResponse alterarSenha(AlterarSenhaRequest request) {
		if (!request.novaSenha().equals(request.confirmarSenha())) {
			throw new BusinessException("A confirmacao da senha nao confere");
		}

		var usuario = currentUserService.getCurrentUser();
		if (!passwordEncoder.matches(request.senhaAtual(), usuario.getSenha())) {
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
			throw new BusinessException("A confirmacao da senha nao confere");
		}
		throw new BusinessException("Recuperacao de senha ainda depende da configuracao de envio de e-mail");
	}
}
