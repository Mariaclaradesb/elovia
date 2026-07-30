package elovia.eloviaapi.service;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

import elovia.eloviaapi.dto.EsqueciSenhaRequest;
import elovia.eloviaapi.dto.RedefinirSenhaRequest;
import elovia.eloviaapi.model.RecuperacaoSenha;
import elovia.eloviaapi.model.Usuario;
import elovia.eloviaapi.repository.RecuperacaoSenhaRepository;
import elovia.eloviaapi.repository.UsuarioRepository;
import elovia.eloviaapi.security.JwtService;

class AuthServicePasswordResetTest {

	private UsuarioRepository usuarioRepository;
	private RecuperacaoSenhaRepository recuperacaoSenhaRepository;
	private PasswordEncoder passwordEncoder;
	private NotificationService notificationService;
	private AuthService authService;
	private Usuario usuario;

	@BeforeEach
	void setUp() {
		usuarioRepository = mock(UsuarioRepository.class);
		recuperacaoSenhaRepository = mock(RecuperacaoSenhaRepository.class);
		passwordEncoder = mock(PasswordEncoder.class);
		notificationService = mock(NotificationService.class);
		authService = new AuthService(
				usuarioRepository,
				recuperacaoSenhaRepository,
				passwordEncoder,
				mock(JwtService.class),
				mock(CurrentUserService.class),
				mock(SupabaseStorageService.class),
				mock(FotoPerfilService.class),
				notificationService,
				15);

		usuario = mock(Usuario.class);
		when(usuario.getId()).thenReturn(UUID.randomUUID());
		when(usuario.getEmail()).thenReturn("mediador@elovia.test");
		when(usuario.isAtivo()).thenReturn(true);
		when(usuarioRepository.findByEmailIgnoreCase("mediador@elovia.test")).thenReturn(Optional.of(usuario));
	}

	@Test
	void deveGerarCodigoDeOitoDigitosEArmazenarSomenteHash() {
		when(recuperacaoSenhaRepository.findByUsuarioId(usuario.getId())).thenReturn(Optional.empty());

		authService.esqueciSenha(new EsqueciSenhaRequest("mediador@elovia.test"));

		var codigoCaptor = ArgumentCaptor.forClass(String.class);
		verify(notificationService).sendPasswordResetCode(any(), codigoCaptor.capture(), any(Integer.class));
		var codigo = codigoCaptor.getValue();
		assertTrue(codigo.matches("\\d{8}"));

		var recuperacaoCaptor = ArgumentCaptor.forClass(RecuperacaoSenha.class);
		verify(recuperacaoSenhaRepository).save(recuperacaoCaptor.capture());
		assertNotEquals(codigo, recuperacaoCaptor.getValue().getCodigoHash());
	}

	@Test
	void deveConsumirCodigoEAtualizarSenha() {
		when(recuperacaoSenhaRepository.findByUsuarioId(usuario.getId()))
				.thenReturn(Optional.empty());
		authService.esqueciSenha(new EsqueciSenhaRequest("mediador@elovia.test"));

		var codigoCaptor = ArgumentCaptor.forClass(String.class);
		verify(notificationService).sendPasswordResetCode(any(), codigoCaptor.capture(), any(Integer.class));
		var recuperacaoCaptor = ArgumentCaptor.forClass(RecuperacaoSenha.class);
		verify(recuperacaoSenhaRepository).save(recuperacaoCaptor.capture());
		var recuperacao = recuperacaoCaptor.getValue();

		when(recuperacaoSenhaRepository.findByUsuarioId(usuario.getId())).thenReturn(Optional.of(recuperacao));
		when(passwordEncoder.encode("NovaSenha123")).thenReturn("senha-codificada");

		authService.redefinirSenha(new RedefinirSenhaRequest(
				"mediador@elovia.test",
				codigoCaptor.getValue(),
				"NovaSenha123",
				"NovaSenha123"));

		verify(usuario).setSenha("senha-codificada");
		verify(usuario).setPrimeiroAcesso(false);
		verify(recuperacaoSenhaRepository).delete(recuperacao);
	}
}
