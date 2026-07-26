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
		String escola,
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
		return new MediadorResponse(
				usuario.getId(),
				usuario.getNome(),
				usuario.getCpf(),
				usuario.getEmail(),
				usuario.getTelefone(),
				usuario.getEscola(),
				usuario.getCargo(),
				usuario.getMatricula(),
				usuario.isPrimeiroAcesso(),
				usuario.isAtivo(),
				usuario.getDataCriacao(),
				usuario.getUltimoLogin(),
				senhaTemporaria);
	}
}
