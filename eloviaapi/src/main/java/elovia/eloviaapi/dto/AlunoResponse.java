package elovia.eloviaapi.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import elovia.eloviaapi.model.Aluno;

public record AlunoResponse(
		UUID id,
		String nome,
		String foto,
		LocalDate dataNascimento,
		String sexo,
		String escola,
		UUID administradorId,
		String turma,
		String turno,
		String responsavel,
		String telefoneResponsavel,
		String emailResponsavel,
		List<ResponsavelAlunoResponse> responsaveis,
		String diagnostico,
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
		List<UUID> mediadorIds,
		boolean ativo,
		Instant criadoEm,
		Instant atualizadoEm) {

	public static AlunoResponse from(Aluno aluno) {
		return new AlunoResponse(
				aluno.getId(),
				aluno.getNome(),
				aluno.getFoto(),
				aluno.getDataNascimento(),
				aluno.getSexo(),
				aluno.getEscola(),
				aluno.getAdministrador() != null ? aluno.getAdministrador().getId() : null,
				aluno.getTurma(),
				aluno.getTurno(),
				aluno.getResponsavel(),
				aluno.getTelefoneResponsavel(),
				aluno.getEmailResponsavel(),
				responsaveisFrom(aluno),
				aluno.getDiagnostico(),
				aluno.getCid(),
				aluno.isNecessitaMediador(),
				aluno.getObservacoesIniciais(),
				aluno.getEstrategias(),
				aluno.getGatilhos(),
				aluno.getPreferencias(),
				aluno.getInteresses(),
				aluno.getObjetivosPdi(),
				aluno.getFormaComunicacao(),
				aluno.getObservacoes(),
				aluno.getMediadores().stream().map(mediador -> mediador.getId()).toList(),
				aluno.isAtivo(),
				aluno.getCriadoEm(),
				aluno.getAtualizadoEm());
	}

	private static List<ResponsavelAlunoResponse> responsaveisFrom(Aluno aluno) {
		if (aluno.getResponsaveis() == null || aluno.getResponsaveis().isBlank()) {
			if (aluno.getResponsavel() == null || aluno.getResponsavel().isBlank()) {
				return List.of();
			}
			return List.of(new ResponsavelAlunoResponse(
					aluno.getResponsavel(),
					aluno.getTelefoneResponsavel(),
					aluno.getEmailResponsavel()));
		}

		return aluno.getResponsaveis().lines()
				.map(line -> line.split("\t", -1))
				.map(parts -> new ResponsavelAlunoResponse(
						parts.length > 0 ? parts[0] : "",
						parts.length > 1 ? parts[1] : "",
						parts.length > 2 ? parts[2] : ""))
				.toList();
	}
}
