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
		List<ComprometimentoAlunoResponse> comprometimentos,
		boolean emInvestigacao,
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
				comprometimentosFrom(aluno),
				aluno.isEmInvestigacao(),
				aluno.getMediadores().isEmpty(),
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
		return aluno.getResponsaveis().stream()
				.map(ResponsavelAlunoResponse::from)
				.toList();
	}

	private static List<ComprometimentoAlunoResponse> comprometimentosFrom(Aluno aluno) {
		return aluno.getComprometimentos().stream()
				.map(ComprometimentoAlunoResponse::from)
				.toList();
	}
}
