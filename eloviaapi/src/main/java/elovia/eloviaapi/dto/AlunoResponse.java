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
}
