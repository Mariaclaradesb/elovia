package elovia.eloviaapi.service;

import static elovia.eloviaapi.dto.RelatorioMensalResponse.*;

import java.time.*;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import elovia.eloviaapi.dto.RelatorioMensalResponse;
import elovia.eloviaapi.exception.BusinessException;
import elovia.eloviaapi.repository.*;

@Service
public class RelatorioMensalService {
	private static final Duration PHOTO_LINK_DURATION = Duration.ofHours(2);
	private final AlunoService alunoService;
	private final CurrentUserService currentUserService;
	private final SessaoAcompanhamentoRepository sessaoRepository;
	private final ObservacaoRepository observacaoRepository;
	private final EvidenciaPortfolioRepository evidenciaRepository;
	private final SupabaseStorageService storageService;
	private final FotoPerfilService fotoPerfilService;

	public RelatorioMensalService(AlunoService alunoService, CurrentUserService currentUserService,
			SessaoAcompanhamentoRepository sessaoRepository, ObservacaoRepository observacaoRepository,
			EvidenciaPortfolioRepository evidenciaRepository, SupabaseStorageService storageService,
			FotoPerfilService fotoPerfilService) {
		this.alunoService = alunoService; this.currentUserService = currentUserService;
		this.sessaoRepository = sessaoRepository; this.observacaoRepository = observacaoRepository;
		this.evidenciaRepository = evidenciaRepository; this.storageService = storageService;
		this.fotoPerfilService = fotoPerfilService;
	}

	@Transactional(readOnly = true)
	public RelatorioMensalResponse generate(UUID alunoId, int mes, int ano) {
		if (mes < 1 || mes > 12 || ano < 2020 || ano > LocalDate.now().getYear() + 1) {
			throw new BusinessException("Informe um mes e ano validos");
		}
		var aluno = alunoService.findEntityById(alunoId);
		var mediator = currentUserService.getCurrentUser();
		var start = LocalDate.of(ano, mes, 1);
		var end = start.withDayOfMonth(start.lengthOfMonth());
		var sessions = sessaoRepository.findRelatorioMensal(alunoId, start, end);
		var observations = observacaoRepository.findRelatorioMensal(alunoId, start, end);
		var evidences = evidenciaRepository.findByAlunoIdAndAtivoTrueAndDataBetweenOrderByRegistradoEmAsc(alunoId, start, end);

		var sessionItems = sessions.stream().map(s -> new Atendimento(s.getId(), s.getData(), s.getInicio(), s.getFim(),
				s.getPeriodo() != null ? s.getPeriodo().name() : null, s.getStatus().name())).toList();
		var recordItems = observations.stream().map(o -> new Registro(o.getId(), o.getSessao().getData(), o.getCreatedAt(),
				o.getDisciplina(), o.getDescricao(), o.getCategoria().name(), o.getTipoRegistro().name())).toList();
		var evidenceItems = evidences.stream().map(e -> new Evidencia(e.getId(), e.getData(), e.getHorario().toString(),
				e.getDisciplina(), e.getTitulo(), e.getDescricao(), e.getStatusAtividade().name(),
				e.getFotos().stream().map(f -> storageService.signedUrl(f.getCaminho(), PHOTO_LINK_DURATION)).toList())).toList();

		var recordsBySubject = observations.stream().collect(Collectors.groupingBy(
				o -> normalizedSubject(o.getDisciplina()), LinkedHashMap::new, Collectors.collectingAndThen(Collectors.counting(), Long::intValue)));
		var subjects = new LinkedHashSet<String>(); subjects.addAll(recordsBySubject.keySet());
		evidences.stream().map(e -> normalizedSubject(e.getDisciplina())).forEach(subjects::add);
		var sessionsByWeek = countByWeek(sessions.stream().map(s -> s.getData()).toList());
		var evidencesByWeek = countByWeek(evidences.stream().map(e -> e.getData()).toList());
		var attendanceDays = sessions.stream().map(s -> s.getData()).distinct().count();
		var attendanceWeeks = sessions.stream().map(s -> weekLabel(s.getData())).distinct().count();
		var indicators = new Indicadores(sessions.size(), observations.size(), evidences.size(), subjects.size(),
				(int) attendanceDays, (int) attendanceWeeks);

		return new RelatorioMensalResponse(
				new AlunoResumo(aluno.getId(), aluno.getNome(), fotoPerfilService.urlAcessivel(aluno.getFoto()), aluno.getTurma(), aluno.getEscola()),
				new MediadorResumo(mediator.getId(), mediator.getNome(), mediator.getEscola()),
				new Periodo(mes, ano, start, end), indicators, sessionItems, recordItems, evidenceItems,
				new Graficos(sessionsByWeek, recordsBySubject, evidencesByWeek),
				buildSummary(start, indicators, recordsBySubject, subjects), Instant.now());
	}

	private Map<String, Integer> countByWeek(List<LocalDate> dates) {
		var result = new LinkedHashMap<String, Integer>();
		for (int week = 1; week <= 5; week++) result.put("Semana " + week, 0);
		dates.forEach(date -> result.computeIfPresent(weekLabel(date), (key, value) -> value + 1));
		return result;
	}

	private String weekLabel(LocalDate date) { return "Semana " + (((date.getDayOfMonth() - 1) / 7) + 1); }
	private String normalizedSubject(String value) { return value == null || value.isBlank() ? "Sem disciplina informada" : value.trim(); }

	private String buildSummary(LocalDate start, Indicadores indicators, Map<String, Integer> recordsBySubject, Set<String> subjects) {
		var month = start.getMonth().getDisplayName(TextStyle.FULL, Locale.forLanguageTag("pt-BR"));
		var summary = new StringBuilder("Durante o mês de ").append(month).append(" de ").append(start.getYear())
				.append(", foram realizados ").append(indicators.atendimentos()).append(" atendimento(s), em ")
				.append(indicators.diasComAtendimento()).append(" dia(s) de acompanhamento. Foram registrados ")
				.append(indicators.registros()).append(" registro(s)");
		summary.append(".");
		if (!recordsBySubject.isEmpty()) {
			summary.append(" A distribuição dos registros por disciplina foi: ")
					.append(recordsBySubject.entrySet().stream()
							.map(entry -> entry.getKey() + " (" + entry.getValue() + ")")
							.collect(Collectors.joining(", ")))
					.append(".");
		}
		summary.append(" Foram adicionadas ").append(indicators.evidencias()).append(" evidência(s) ao Portfólio Digital.");
		if (!recordsBySubject.isEmpty()) {
			var top = recordsBySubject.entrySet().stream().max(Map.Entry.comparingByValue()).orElseThrow();
			summary.append(" A disciplina com maior quantidade de registros foi ").append(top.getKey())
					.append(", com ").append(top.getValue()).append(" registro(s).");
		}
		return summary.toString();
	}
}
