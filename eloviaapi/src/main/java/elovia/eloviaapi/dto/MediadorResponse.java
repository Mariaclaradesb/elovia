package elovia.eloviaapi.dto;

import java.time.Instant;
import java.util.UUID;

import elovia.eloviaapi.model.Usuario;

public record MediadorResponse(
		UUID id,
		String nome,
		String cpf,
		String email,
		String telefone,
		String foto,
		String escola,
		UUID administradorId,
		String cargo,
		String matricula,
		boolean primeiroAcesso,
		boolean ativo,
		Instant dataCriacao,
		Instant ultimoLogin,
		String senhaTemporaria) {

	public static MediadorResponse from(Usuario usuario) {
		return from(usuario, null);
	}

	public static MediadorResponse from(Usuario usuario, String senhaTemporaria) {
		return from(usuario, usuario.getFoto(), senhaTemporaria);
	}

	public static MediadorResponse from(Usuario usuario, String foto, String senhaTemporaria) {
		return new MediadorResponse(
				usuario.getId(),
				usuario.getNome(),
				usuario.getCpf(),
				usuario.getEmail(),
				usuario.getTelefone(),
				foto,
				usuario.getEscola(),
				usuario.getAdministrador() != null ? usuario.getAdministrador().getId() : null,
				usuario.getCargo(),
				usuario.getMatricula(),
				usuario.isPrimeiroAcesso(),
				usuario.isAtivo(),
				usuario.getDataCriacao(),
				usuario.getUltimoLogin(),
				senhaTemporaria);
	}
}
