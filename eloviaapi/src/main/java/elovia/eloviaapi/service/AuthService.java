package elovia.eloviaapi.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import elovia.eloviaapi.dto.AlterarSenhaRequest;
import elovia.eloviaapi.dto.AtualizarPerfilRequest;
import elovia.eloviaapi.dto.CadastrarAdminRequest;
import elovia.eloviaapi.dto.EsqueciSenhaRequest;
import elovia.eloviaapi.dto.LoginRequest;
import elovia.eloviaapi.dto.LoginResponse;
import elovia.eloviaapi.dto.RedefinirSenhaRequest;
import elovia.eloviaapi.dto.UsuarioResponse;
import elovia.eloviaapi.exception.BusinessException;
import elovia.eloviaapi.model.RecuperacaoSenha;
import elovia.eloviaapi.model.Role;
import elovia.eloviaapi.model.Usuario;
import elovia.eloviaapi.repository.RecuperacaoSenhaRepository;
import elovia.eloviaapi.repository.UsuarioRepository;
import elovia.eloviaapi.security.JwtService;

@Service
public class AuthService {

	private static final int MAX_RESET_ATTEMPTS = 5;

	private final UsuarioRepository usuarioRepository;
	private final RecuperacaoSenhaRepository recuperacaoSenhaRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final CurrentUserService currentUserService;
	private final SupabaseStorageService storageService;
	private final NotificationService notificationService;
	private final int resetExpirationMinutes;
	private final SecureRandom secureRandom = new SecureRandom();

	public AuthService(
			UsuarioRepository usuarioRepository,
			RecuperacaoSenhaRepository recuperacaoSenhaRepository,
			PasswordEncoder passwordEncoder,
			JwtService jwtService,
			CurrentUserService currentUserService,
			SupabaseStorageService storageService,
			NotificationService notificationService,
			@Value("${app.password-reset.expiration-minutes:15}") int resetExpirationMinutes) {
		this.usuarioRepository = usuarioRepository;
		this.recuperacaoSenhaRepository = recuperacaoSenhaRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.currentUserService = currentUserService;
		this.storageService = storageService;
		this.notificationService = notificationService;
		this.resetExpirationMinutes = resetExpirationMinutes;
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
			throw new BusinessException("A confirmacao da senha nao confere");
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
	public UsuarioResponse atualizarFoto(MultipartFile arquivo) {
		if (arquivo == null || arquivo.isEmpty()) {
			throw new BusinessException("Selecione uma foto");
		}
		if (arquivo.getContentType() == null || !arquivo.getContentType().startsWith("image/")) {
			throw new BusinessException("Envie uma imagem PNG ou JPG");
		}

		var usuario = currentUserService.getCurrentUser();
		var nomeOriginal = arquivo.getOriginalFilename() != null ? arquivo.getOriginalFilename() : "perfil.jpg";
		var nomeLimpo = nomeOriginal.replaceAll("[^a-zA-Z0-9._-]", "_");
		var caminho = "perfis/" + usuario.getId() + "/" + UUID.randomUUID() + "-" + nomeLimpo;
		usuario.setFoto(storageService.upload(caminho, arquivo));
		return UsuarioResponse.from(usuario);
	}

	@Transactional
	public UsuarioResponse alterarSenha(AlterarSenhaRequest request) {
		if (!request.novaSenha().equals(request.confirmarSenha())) {
			throw new BusinessException("A confirmacao da senha nao confere");
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

	@Transactional
	public void esqueciSenha(EsqueciSenhaRequest request) {
		usuarioRepository.findByEmailIgnoreCase(request.email())
				.filter(Usuario::isAtivo)
				.ifPresent(usuario -> {
					var codigo = String.format(Locale.ROOT, "%08d", secureRandom.nextInt(100_000_000));
					var recuperacao = recuperacaoSenhaRepository.findByUsuarioId(usuario.getId())
							.orElseGet(RecuperacaoSenha::new);
					recuperacao.setUsuario(usuario);
					recuperacao.setCodigoHash(hash(codigo));
					recuperacao.setExpiraEm(Instant.now().plus(resetExpirationMinutes, ChronoUnit.MINUTES));
					recuperacao.setTentativas(0);
					recuperacaoSenhaRepository.save(recuperacao);
					notificationService.sendPasswordResetCode(usuario, codigo, resetExpirationMinutes);
				});
	}

	@Transactional(noRollbackFor = BusinessException.class)
	public void redefinirSenha(RedefinirSenhaRequest request) {
		if (!request.novaSenha().equals(request.confirmarSenha())) {
			throw new BusinessException("A confirmacao da senha nao confere");
		}

		var usuario = usuarioRepository.findByEmailIgnoreCase(request.email())
				.filter(Usuario::isAtivo)
				.orElseThrow(this::invalidResetCode);
		var recuperacao = recuperacaoSenhaRepository.findByUsuarioId(usuario.getId())
				.orElseThrow(this::invalidResetCode);

		if (recuperacao.getExpiraEm().isBefore(Instant.now()) || recuperacao.getTentativas() >= MAX_RESET_ATTEMPTS) {
			recuperacaoSenhaRepository.delete(recuperacao);
			throw invalidResetCode();
		}

		if (!secureEquals(recuperacao.getCodigoHash(), hash(request.codigo()))) {
			recuperacao.setTentativas(recuperacao.getTentativas() + 1);
			if (recuperacao.getTentativas() >= MAX_RESET_ATTEMPTS) {
				recuperacaoSenhaRepository.delete(recuperacao);
			}
			throw invalidResetCode();
		}

		usuario.setSenha(passwordEncoder.encode(request.novaSenha()));
		usuario.setPrimeiroAcesso(false);
		recuperacaoSenhaRepository.delete(recuperacao);
	}

	private BusinessException invalidResetCode() {
		return new BusinessException("Codigo invalido ou expirado");
	}

	private String hash(String value) {
		try {
			var digest = MessageDigest.getInstance("SHA-256");
			return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
		} catch (NoSuchAlgorithmException exception) {
			throw new IllegalStateException("SHA-256 indisponivel", exception);
		}
	}

	private boolean secureEquals(String expected, String actual) {
		return MessageDigest.isEqual(
				expected.getBytes(StandardCharsets.US_ASCII),
				actual.getBytes(StandardCharsets.US_ASCII));
	}
}
