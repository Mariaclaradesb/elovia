package elovia.eloviaapi.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.text.Normalizer;
import java.util.UUID;

import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.springframework.stereotype.Service;

import elovia.eloviaapi.dto.DocumentoAlunoResponse;
import elovia.eloviaapi.exception.BusinessException;
import elovia.eloviaapi.model.Anamnese;
import elovia.eloviaapi.model.AnamneseAnexo;
import elovia.eloviaapi.model.CategoriaDocumento;
import elovia.eloviaapi.model.DocumentoAluno;
import elovia.eloviaapi.repository.DocumentoAlunoRepository;

@Service
public class AnamneseDocxService {

	private static final String DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
	private static final DateTimeFormatter DATA_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");
	private static final String VERDE = "1D8B77";
	private static final String ROXO = "7D70BA";
	private final SupabaseStorageService storageService;
	private final DocumentoAlunoRepository documentoRepository;
	private final CurrentUserService currentUserService;

	public AnamneseDocxService(
			SupabaseStorageService storageService,
			DocumentoAlunoRepository documentoRepository,
			CurrentUserService currentUserService) {
		this.storageService = storageService;
		this.documentoRepository = documentoRepository;
		this.currentUserService = currentUserService;
	}

	public DocumentoAlunoResponse gerar(Anamnese anamnese) {
		var conteudo = criarDocumento(anamnese);
		var aluno = anamnese.getAluno();
		var nomeArquivo = "anamnese-" + normalizarNome(aluno.getNome()) + "-" + LocalDate.now() + ".docx";
		var caminho = "alunos/" + aluno.getId() + "/anamnese/" + UUID.randomUUID() + "-" + nomeArquivo;
		var url = storageService.upload(caminho, conteudo, DOCX_TYPE);

		var documento = new DocumentoAluno();
		documento.setTitulo("Anamnese - " + aluno.getNome());
		documento.setDescricao("Relatorio institucional da anamnese do aluno.");
		documento.setCategoria(CategoriaDocumento.RELATORIO_PEDAGOGICO);
		documento.setNomeArquivo(nomeArquivo);
		documento.setTipoArquivo(DOCX_TYPE);
		documento.setTamanhoArquivo(conteudo.length);
		documento.setCaminhoArquivo(caminho);
		documento.setUrlArquivo(url);
		documento.setDataDocumento(LocalDate.now());
		documento.setAluno(aluno);
		documento.setUsuarioUpload(currentUserService.getCurrentUser());
		documentoRepository.save(documento);

		var anexo = new AnamneseAnexo();
		anexo.setDocumento(documento);
		anamnese.addAnexo(anexo);
		return DocumentoAlunoResponse.from(documento);
	}

	byte[] criarDocumento(Anamnese a) {
		try (var document = new XWPFDocument(); var output = new ByteArrayOutputStream()) {
			adicionarCabecalho(document);
			adicionarSecao(document, "1. Identificacao");
			var aluno = a.getAluno();
			var identificacao = document.createTable();
			identificacao.setWidth("100%");
			linha(identificacao, "Aluno", aluno.getNome());
			linha(identificacao, "Escola", aluno.getEscola());
			linha(identificacao, "Turma / turno", combinar(aluno.getTurma(), aluno.getTurno()));
			linha(identificacao, "Data de nascimento", aluno.getDataNascimento() != null ? aluno.getDataNascimento().format(DATA_BR) : null);
			linha(identificacao, "Professor(a) da sala de recursos", a.getProfessorSalaRecursos());
			linha(identificacao, "Profissional de apoio", combinar(a.getProfissionalApoio(), a.getFuncaoProfissionalApoio()));
			if (!aluno.getResponsaveis().isEmpty()) {
				var responsaveis = document.createTable();
				cabecalho(responsaveis, "Responsavel", "Telefone", "E-mail");
				aluno.getResponsaveis().forEach(item -> linha(
						responsaveis, item.getNome(), item.getTelefone(), item.getEmail()));
			}

			adicionarSecao(document, "2. Comprometimentos e CIDs");
			if (a.getDiagnosticos().isEmpty()) {
				adicionarResposta(document, "Comprometimentos", aluno.isEmInvestigacao() ? "Em investigacao" : null);
			} else {
				var tabela = document.createTable();
				cabecalho(tabela, "Comprometimento", "CID");
				a.getDiagnosticos().forEach(item -> linha(tabela, item.getComprometimento(), item.getCid()));
			}
			adicionarResposta(document, "Motivo da matricula na sala de recursos", a.getMotivoMatriculaSrm());

			adicionarSecao(document, "3. Historico do aluno");
			adicionarResposta(document, "Quem e o aluno?", a.getQuemEAluno());
			adicionarResposta(document, "Onde mora?", a.getOndeMora());
			adicionarResposta(document, "Com quem mora?", a.getComQuemMora());
			adicionarResposta(document, "Como foi o desenvolvimento?", a.getDesenvolvimento());
			adicionarResposta(document, "Como ocorreu a gestacao?", a.getGestacao());
			adicionarResposta(document, "Houve complicacoes no parto?", a.getComplicacoesParto());
			adicionarResposta(document, "Possui irmaos?", Boolean.TRUE.equals(a.getPossuiIrmaos())
					? "Sim. Quantidade: " + valor(a.getQuantidadeIrmaos()) : "Nao");
			adicionarResposta(document, "Comunicacao", a.getComunicacao());

			adicionarSecao(document, "4. Saude");
			adicionarResposta(document, "Faz uso de medicacao?", simNao(a.getUsaMedicacao()));
			if (!a.getMedicamentos().isEmpty()) {
				var tabela = document.createTable();
				cabecalho(tabela, "Medicamento", "Dosagem", "Horario", "Observacoes");
				a.getMedicamentos().forEach(item -> linha(tabela, item.getNome(), item.getDosagem(), item.getHorario(), item.getObservacoes()));
			}
			if (!a.getTerapias().isEmpty()) {
				var tabela = document.createTable();
				cabecalho(tabela, "Terapia", "Frequencia", "Profissional", "Observacoes");
				a.getTerapias().forEach(item -> linha(tabela, item.getTipo(), item.getFrequencia(), item.getProfissional(), item.getObservacoes()));
			}
			adicionarResposta(document, "Alergias", a.getAlergias());
			adicionarResposta(document, "Restricoes alimentares", a.getRestricoesAlimentares());
			adicionarResposta(document, "Crises recorrentes", a.getCrisesRecorrentes());
			adicionarResposta(document, "Informacoes medicas importantes", a.getInformacoesMedicas());

			adicionarSecao(document, "5. Perfil pedagogico");
			adicionarResposta(document, "Potencialidades", a.getPotencialidades());
			adicionarResposta(document, "Interesses", a.getInteresses());
			adicionarResposta(document, "Maior facilidade", a.getMaiorFacilidade());
			adicionarResposta(document, "Maior dificuldade", a.getMaiorDificuldade());
			adicionarResposta(document, "Necessita de adaptacoes?", a.getNecessitaAdaptacoes());
			adicionarResposta(document, "Como reage a mudancas?", a.getReacaoMudancas());
			adicionarResposta(document, "Possui hiperfoco?", a.getHiperfoco());
			adicionarResposta(document, "Como aprende melhor?", a.getFormasAprendizagem());

			adicionarSecao(document, "6. Informacoes da familia");
			adicionarResposta(document, "Responsavel respondente", a.getResponsavelRespondente());
			adicionarResposta(document, "Rotina em casa", a.getRotinaCasa());
			adicionarResposta(document, "Expectativas da familia", a.getExpectativasFamilia());
			adicionarResposta(document, "Orientacao importante", a.getOrientacaoImportante());
			adicionarResposta(document, "Comportamentos observados fora da escola", a.getComportamentosForaEscola());

			adicionarSecao(document, "7. Observacoes da escola");
			adicionarResposta(document, "Observacao em sala e outros espacos", a.getObservacaoSalaOutrosEspacos());
			adicionarResposta(document, "Professor regente", a.getProfessorRegente());
			adicionarResposta(document, "Sala de recursos", a.getSalaRecursos());
			adicionarResposta(document, "Equipe pedagogica", a.getEquipePedagogica());
			adicionarResposta(document, "Observacoes gerais", a.getObservacoesGerais());

			var rodape = document.createParagraph();
			rodape.setAlignment(ParagraphAlignment.CENTER);
			rodape.setSpacingBefore(360);
			var run = rodape.createRun();
			run.setText("Documento gerado pelo Elovia");
			run.setItalic(true);
			run.setColor(ROXO);
			document.write(output);
			return output.toByteArray();
		} catch (IOException exception) {
			throw new BusinessException("Nao foi possivel gerar o relatorio DOCX");
		}
	}

	private void adicionarCabecalho(XWPFDocument document) {
		var titulo = document.createParagraph();
		titulo.setAlignment(ParagraphAlignment.CENTER);
		var tituloRun = titulo.createRun();
		tituloRun.setText("ELOVIA");
		tituloRun.setBold(true);
		tituloRun.setFontSize(22);
		tituloRun.setColor(VERDE);
		var subtitulo = document.createParagraph();
		subtitulo.setAlignment(ParagraphAlignment.CENTER);
		var subtituloRun = subtitulo.createRun();
		subtituloRun.setText("RELATORIO DE ANAMNESE DO ALUNO");
		subtituloRun.setBold(true);
		subtituloRun.setFontSize(14);
		subtituloRun.setColor(ROXO);
		var data = document.createParagraph();
		data.setAlignment(ParagraphAlignment.CENTER);
		data.createRun().setText("Data de emissao: " + LocalDate.now().format(DATA_BR));
	}

	private void adicionarSecao(XWPFDocument document, String texto) {
		var paragraph = document.createParagraph();
		paragraph.setSpacingBefore(260);
		paragraph.setSpacingAfter(80);
		var run = paragraph.createRun();
		run.setText(texto);
		run.setBold(true);
		run.setFontSize(13);
		run.setColor(VERDE);
	}

	private void adicionarResposta(XWPFDocument document, String pergunta, Object resposta) {
		var paragraph = document.createParagraph();
		paragraph.setSpacingAfter(80);
		var label = paragraph.createRun();
		label.setText(pergunta + ": ");
		label.setBold(true);
		paragraph.createRun().setText(valor(resposta));
	}

	private void cabecalho(XWPFTable table, String... valores) {
		table.setWidth("100%");
		preencherLinha(table.getRow(0), valores, true);
	}

	private void linha(XWPFTable table, String... valores) {
		XWPFTableRow row = table.getNumberOfRows() == 1 && table.getRow(0).getCell(0).getText().isBlank()
				? table.getRow(0) : table.createRow();
		preencherLinha(row, valores, false);
	}

	private void preencherLinha(XWPFTableRow row, String[] valores, boolean cabecalho) {
		while (row.getTableCells().size() < valores.length) row.addNewTableCell();
		for (int index = 0; index < valores.length; index++) {
			var cell = row.getCell(index);
			cell.removeParagraph(0);
			var run = cell.addParagraph().createRun();
			run.setText(valor(valores[index]));
			run.setBold(cabecalho);
			if (cabecalho) run.setColor(ROXO);
		}
	}

	private String combinar(String primeiro, String segundo) {
		if (primeiro == null || primeiro.isBlank()) return valor(segundo);
		if (segundo == null || segundo.isBlank()) return primeiro;
		return primeiro + " - " + segundo;
	}

	private String simNao(Boolean value) {
		return value == null ? "Nao informado" : value ? "Sim" : "Nao";
	}

	private String valor(Object value) {
		return value == null || value.toString().isBlank() ? "Nao informado" : value.toString().replace('\n', ' ');
	}

	private String normalizarNome(String nome) {
		var semAcentos = Normalizer.normalize(nome, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
		return semAcentos.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
	}
}
