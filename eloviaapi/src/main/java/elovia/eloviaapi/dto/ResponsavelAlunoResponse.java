package elovia.eloviaapi.dto;

import java.util.UUID;

import elovia.eloviaapi.model.ResponsavelAluno;

public record ResponsavelAlunoResponse(
		UUID id,
		String nome,
		String telefone,
		String email) {

	public static ResponsavelAlunoResponse from(ResponsavelAluno responsavel) {
		return new ResponsavelAlunoResponse(
				responsavel.getId(),
				responsavel.getNome(),
				responsavel.getTelefone(),
				responsavel.getEmail());
	}
}
