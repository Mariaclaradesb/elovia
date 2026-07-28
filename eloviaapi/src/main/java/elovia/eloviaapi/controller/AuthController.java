package elovia.eloviaapi.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import elovia.eloviaapi.dto.AlterarSenhaRequest;
import elovia.eloviaapi.dto.AtualizarPerfilRequest;
import elovia.eloviaapi.dto.CadastrarAdminRequest;
import elovia.eloviaapi.dto.EsqueciSenhaRequest;
import elovia.eloviaapi.dto.LoginRequest;
import elovia.eloviaapi.dto.LoginResponse;
import elovia.eloviaapi.dto.RedefinirSenhaRequest;
import elovia.eloviaapi.dto.UsuarioResponse;
import elovia.eloviaapi.service.AuthService;
import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/auth", "/auth"})
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/login")
	public LoginResponse login(@Valid @RequestBody LoginRequest request) {
		return authService.login(request);
	}

	@PostMapping("/cadastrar-admin")
	public LoginResponse cadastrarAdmin(@Valid @RequestBody CadastrarAdminRequest request) {
		return authService.cadastrarAdmin(request);
	}

	@GetMapping("/me")
	public UsuarioResponse me() {
		return authService.me();
	}

	@PatchMapping("/me")
	public UsuarioResponse atualizarPerfil(@Valid @RequestBody AtualizarPerfilRequest request) {
		return authService.atualizarPerfil(request);
	}

	@PatchMapping("/alterar-senha")
	public UsuarioResponse alterarSenha(@Valid @RequestBody AlterarSenhaRequest request) {
		return authService.alterarSenha(request);
	}

	@PostMapping("/esqueci-senha")
	public ResponseEntity<Void> esqueciSenha(@Valid @RequestBody EsqueciSenhaRequest request) {
		authService.esqueciSenha(request);
		return ResponseEntity.accepted().build();
	}

	@PostMapping("/redefinir-senha")
	public ResponseEntity<Void> redefinirSenha(@Valid @RequestBody RedefinirSenhaRequest request) {
		authService.redefinirSenha(request);
		return ResponseEntity.noContent().build();
	}
}
