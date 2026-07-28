package elovia.eloviaapi.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record AlunoRequest(
		@NotBlank String nome,
		String foto,
		@NotNull LocalDate dataNascimento,
		@NotBlank String sexo,
		@NotBlank String escola,
		String turma,
		@NotBlank String turno,
		String responsavel,
		String telefoneResponsavel,
		String emailResponsavel,
		@Valid @NotEmpty List<ResponsavelAlunoRequest> responsaveis,
		String diagnostico,
		String cid,
		@Valid List<ComprometimentoAlunoRequest> comprometimentos,
		Boolean emInvestigacao,
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
