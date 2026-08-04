package elovia.eloviaapi.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record RelatorioMensalResponse(
		AlunoResumo aluno,
		MediadorResumo mediador,
		Periodo periodo,
		Indicadores indicadores,
		List<Atendimento> atendimentos,
		List<Registro> registros,
		List<Evidencia> evidencias,
		Graficos graficos,
		String resumoAutomatico,
		Instant geradoEm) {

	public record AlunoResumo(UUID id, String nome, String foto, String turma, String escola) { }
	public record MediadorResumo(UUID id, String nome, String escola) { }
	public record Periodo(int mes, int ano, LocalDate inicio, LocalDate fim) { }
	public record Indicadores(int atendimentos, int registros, int evidencias, int disciplinas,
			int diasComAtendimento, int semanasComAtendimento) { }
	public record Atendimento(UUID id, LocalDate data, Instant inicio, Instant fim, String periodo, String status) { }
	public record Registro(UUID id, LocalDate data, Instant horario, String disciplina, String observacao,
			String categoria, String tipoRegistro) { }
	public record Evidencia(UUID id, LocalDate data, String horario, String disciplina, String titulo,
			String descricao, String status, List<String> fotoUrls) { }
	public record Graficos(Map<String, Integer> atendimentosPorSemana,
			Map<String, Integer> registrosPorDisciplina, Map<String, Integer> evidenciasPorSemana) { }
}
