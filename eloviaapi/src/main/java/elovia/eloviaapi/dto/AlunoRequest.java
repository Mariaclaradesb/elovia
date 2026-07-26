package elovia.eloviaapi.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AlunoRequest(
		@NotBlank String nome,
		String foto,
		@NotNull LocalDate dataNascimento,
		@NotBlank String sexo,
		@NotBlank String escola,
		String turma,
		@NotBlank String turno,
		@NotBlank String responsavel,
		@NotBlank String telefoneResponsavel,
		String emailResponsavel,
		@NotBlank String diagnostico,
		String cid,
		boolean necessitaMediador,
		String observacoesIniciais,
		String estrategias,
		String gatilhos,
		String preferencias,
		String interesses,
		String objetivosPdi,
		String formaComunicacao,
		String observacoes,
		List<UUID> mediadorIds) {
}
