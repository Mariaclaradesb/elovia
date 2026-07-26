package elovia.eloviaapi.dto;

import java.time.Instant;
import java.util.UUID;

import elovia.eloviaapi.model.Role;
import elovia.eloviaapi.model.Usuario;

public record UsuarioResponse(
		UUID id,
		String nome,
		String email,
		Role role,
		boolean primeiroAcesso,
		boolean ativo,
		Instant ultimoLogin) {

	public static UsuarioResponse from(Usuario usuario) {
		return new UsuarioResponse(
				usuario.getId(),
				usuario.getNome(),
				usuario.getEmail(),
				usuario.getRole(),
				usuario.isPrimeiroAcesso(),
				usuario.isAtivo(),
				usuario.getUltimoLogin());
	}
}
