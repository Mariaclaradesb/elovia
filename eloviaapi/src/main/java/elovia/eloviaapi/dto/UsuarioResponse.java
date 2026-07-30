package elovia.eloviaapi.dto;

import java.time.Instant;
import java.util.UUID;

import elovia.eloviaapi.model.Role;
import elovia.eloviaapi.model.Usuario;

public record UsuarioResponse(
		UUID id,
		String nome,
		String cpf,
		String email,
		String telefone,
		String foto,
		String escola,
		String cargo,
		String matricula,
		Role role,
		boolean primeiroAcesso,
		boolean ativo,
		Instant ultimoLogin) {

	public static UsuarioResponse from(Usuario usuario) {
		return from(usuario, usuario.getFoto());
	}

	public static UsuarioResponse from(Usuario usuario, String foto) {
		return new UsuarioResponse(
				usuario.getId(),
				usuario.getNome(),
				usuario.getCpf(),
				usuario.getEmail(),
				usuario.getTelefone(),
				foto,
				usuario.getEscola(),
				usuario.getCargo(),
				usuario.getMatricula(),
				usuario.getRole(),
				usuario.isPrimeiroAcesso(),
				usuario.isAtivo(),
				usuario.getUltimoLogin());
	}
}
