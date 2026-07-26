package elovia.eloviaapi.dto;

public record LoginResponse(
		String token,
		UsuarioResponse usuario) {
}
