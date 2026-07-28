package elovia.eloviaapi.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.awt.Color;
import java.awt.Font;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.text.Normalizer;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.apache.poi.util.Units;
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
	private static final String CINZA = "667085";
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
		documento.setDescricao("Relatório institucional da anamnese do aluno.");
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

			// ── 1. Identificação ──────────────────────────────────────────
			adicionarSecao(document, "1. Identificação");
			var aluno = a.getAluno();
			var identificacao = document.createTable();
			identificacao.setWidth("100%");
			linha(identificacao, "Nome completo", aluno.getNome());
			linha(identificacao, "Data de nascimento", aluno.getDataNascimento() != null ? aluno.getDataNascimento().format(DATA_BR) : null);
			linha(identificacao, "Série / Ano", a.getSerie());
			linha(identificacao, "Turma", aluno.getTurma());
			linha(identificacao, "Turno", aluno.getTurno());

			// ── Responsável ──
			adicionarSubtitulo(document, "Responsável(is)");
			var responsavel = document.createTable();
			cabecalho(responsavel, "Nome", "Parentesco", "Telefone");
			linha(responsavel, a.getResponsavelNome(), a.getResponsavelParentesco(), a.getResponsavelTelefone());

			// ── 2. Informações Familiares ─────────────────────────────────
			adicionarSecao(document, "2. Informações Familiares");
			adicionarResposta(document, "Com quem mora?", combinarLista(a.getComQuemMora(), a.getComQuemMoraOutro()));
			adicionarResposta(document, "Onde mora?", a.getOndeMora());
			adicionarResposta(document, "Quem acompanha a rotina escolar?", a.getAcompanhaRotinaEscolar());

			// ── 3. Perfil do Aluno ────────────────────────────────────────
			adicionarSecao(document, "3. Perfil do Aluno");
			adicionarResposta(document, "Como a família descreve o aluno?", a.getDescricaoFamilia());
			adicionarResposta(document, "Principais interesses e potencialidades", a.getInteressesPotencialidades());
			adicionarResposta(document, "Atividades de que mais gosta", a.getAtividadesPreferidas());
			adicionarResposta(document, "Dificuldade mais relevante", a.getDificuldadeImportante());
			adicionarResposta(document, "Orientação importante para a escola", a.getOrientacaoEscola());

			// ── 4. Saúde ─────────────────────────────────────────────────
			adicionarSecao(document, "4. Saúde");
			if (a.getDiagnosticos().isEmpty()) {
				adicionarResposta(document, "Diagnósticos", null);
			} else {
				adicionarSubtitulo(document, "Diagnósticos");
				var tabela = document.createTable();
				cabecalho(tabela, "Diagnóstico / Comprometimento", "CID");
				a.getDiagnosticos().forEach(item -> linha(tabela, item.getComprometimento(), item.getCid()));
			}
			adicionarResposta(document, "Faz uso de medicação?", simNao(a.getUsaMedicacao()));
			if (!a.getMedicamentos().isEmpty()) {
				adicionarSubtitulo(document, "Medicamentos");
				var tabela = document.createTable();
				cabecalho(tabela, "Medicamento", "Dosagem", "Observações");
				a.getMedicamentos().forEach(item -> linha(tabela, item.getNome(), item.getDosagem(), item.getObservacoes()));
			}
			adicionarResposta(document, "Terapias", a.getTerapias().stream().map(item -> item.getTipo()).reduce((x, y) -> x + ", " + y).orElse(null));
			adicionarResposta(document, "Outra terapia", a.getTerapiaOutra());
			adicionarResposta(document, "Alergias", a.getAlergias());
			adicionarResposta(document, "Restrições alimentares", a.getRestricoesAlimentares());

			// ── 5. Comunicação ───────────────────────────────────────────
			adicionarSecao(document, "5. Comunicação");
			adicionarResposta(document, "Como o aluno se comunica?", combinar(a.getComunicacaoTipo(), a.getComunicacaoOutra()));
			adicionarResposta(document, "Como demonstra que precisa de ajuda?", a.getComoPedeAjuda());

			// ── 6. Escola ────────────────────────────────────────────────
			adicionarSecao(document, "6. Escola");
			adicionarResposta(document, "Como foi a adaptação escolar?", a.getAdaptacaoEscolar());
			adicionarResposta(document, "Estratégias que costumam funcionar", a.getEstrategiasFuncionam());
			adicionarResposta(document, "Recomendação do professor anterior", a.getRecomendacaoProfessorAnterior());
			adicionarResposta(document, "Observações gerais", a.getObservacoesGerais());

			// ── Rodapé ───────────────────────────────────────────────────
			var rodape = document.createParagraph();
			rodape.setAlignment(ParagraphAlignment.CENTER);
			rodape.setSpacingBefore(480);
			var divider = rodape.createRun();
			divider.setText("─────────────────────────────────────────");
			divider.setColor(CINZA);

			var rodapeTexto = document.createParagraph();
			rodapeTexto.setAlignment(ParagraphAlignment.CENTER);
			var rodapeRun = rodapeTexto.createRun();
			rodapeRun.setText("Documento gerado automaticamente pelo sistema Elovia  •  " + LocalDate.now().format(DATA_BR));
			rodapeRun.setItalic(true);
			rodapeRun.setColor(CINZA);
			rodapeRun.setFontSize(10);

			document.write(output);
			return output.toByteArray();
		} catch (IOException exception) {
			throw new BusinessException("Não foi possível gerar o relatório DOCX.");
		}
	}

	private void adicionarCabecalho(XWPFDocument document) {
		var titulo = document.createParagraph();
		titulo.setAlignment(ParagraphAlignment.CENTER);
		try {
			var logo = criarLogo();
			titulo.createRun().addPicture(new java.io.ByteArrayInputStream(logo),
					XWPFDocument.PICTURE_TYPE_PNG, "logo-elovia.png", Units.toEMU(150), Units.toEMU(42));
		} catch (Exception ignored) {
			// O título textual abaixo mantém a identidade mesmo se a imagem não puder ser renderizada.
		}
		var tituloRun = titulo.createRun();
		tituloRun.setText("\nELOVIA");
		tituloRun.setBold(true);
		tituloRun.setFontSize(22);
		tituloRun.setColor(VERDE);

		var subtitulo = document.createParagraph();
		subtitulo.setAlignment(ParagraphAlignment.CENTER);
		var subtituloRun = subtitulo.createRun();
		subtituloRun.setText("RELATÓRIO DE ANAMNESE DO ALUNO");
		subtituloRun.setBold(true);
		subtituloRun.setFontSize(14);
		subtituloRun.setColor(ROXO);

		var data = document.createParagraph();
		data.setAlignment(ParagraphAlignment.CENTER);
		data.setSpacingAfter(200);
		data.createRun().setText("Data de emissão: " + LocalDate.now().format(DATA_BR));
	}

	private byte[] criarLogo() throws IOException {
		var image = new BufferedImage(600, 168, BufferedImage.TYPE_INT_ARGB);
		var graphics = image.createGraphics();
		graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
		graphics.setColor(new Color(0x1D8B77));
		graphics.fillRoundRect(8, 8, 152, 152, 52, 52);
		graphics.setColor(Color.WHITE);
		graphics.setFont(new Font("SansSerif", Font.BOLD, 96));
		graphics.drawString("E", 50, 118);
		graphics.setColor(new Color(0x1D8B77));
		graphics.setFont(new Font("SansSerif", Font.BOLD, 88));
		graphics.drawString("ELOVIA", 180, 116);
		graphics.dispose();
		try (var output = new ByteArrayOutputStream()) {
			ImageIO.write(image, "png", output);
			return output.toByteArray();
		}
	}

	private void adicionarSecao(XWPFDocument document, String texto) {
		var paragraph = document.createParagraph();
		paragraph.setSpacingBefore(320);
		paragraph.setSpacingAfter(100);
		var run = paragraph.createRun();
		run.setText(texto);
		run.setBold(true);
		run.setFontSize(13);
		run.setColor(VERDE);
	}

	private void adicionarSubtitulo(XWPFDocument document, String texto) {
		var paragraph = document.createParagraph();
		paragraph.setSpacingBefore(160);
		paragraph.setSpacingAfter(60);
		var run = paragraph.createRun();
		run.setText(texto);
		run.setBold(true);
		run.setFontSize(11);
		run.setColor(ROXO);
	}

	private void adicionarResposta(XWPFDocument document, String pergunta, Object resposta) {
		var paragraph = document.createParagraph();
		paragraph.setSpacingAfter(60);
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
		return primeiro + " — " + segundo;
	}

	private String combinarLista(String lista, String outro) {
		var valores = lista == null ? null : lista.replace("\n", ", ");
		return combinar(valores, outro);
	}

	private String simNao(Boolean value) {
		return value == null ? "Não informado" : value ? "Sim" : "Não";
	}

	private String valor(Object value) {
		return value == null || value.toString().isBlank() ? "Não informado" : value.toString().replace('\n', ' ');
	}

	private String normalizarNome(String nome) {
		var semAcentos = Normalizer.normalize(nome, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
		return semAcentos.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
	}
}
