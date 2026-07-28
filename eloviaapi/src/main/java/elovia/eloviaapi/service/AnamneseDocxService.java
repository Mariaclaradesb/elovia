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
			linha(identificacao, "Nome", aluno.getNome());
			linha(identificacao, "Data de nascimento", aluno.getDataNascimento() != null ? aluno.getDataNascimento().format(DATA_BR) : null);
			linha(identificacao, "Serie", a.getSerie());
			linha(identificacao, "Turma", aluno.getTurma());
			linha(identificacao, "Turno", aluno.getTurno());
			var responsavel = document.createTable();
			cabecalho(responsavel, "Responsavel", "Parentesco", "Telefone");
			linha(responsavel, a.getResponsavelNome(), a.getResponsavelParentesco(), a.getResponsavelTelefone());

			adicionarSecao(document, "2. Informacoes familiares");
			adicionarResposta(document, "Com quem mora?", combinarLista(a.getComQuemMora(), a.getComQuemMoraOutro()));
			adicionarResposta(document, "Onde mora?", a.getOndeMora());
			adicionarResposta(document, "Quem acompanha a rotina escolar?", a.getAcompanhaRotinaEscolar());

			adicionarSecao(document, "3. Informacoes gerais");
			adicionarResposta(document, "Como a familia descreve o aluno?", a.getDescricaoFamilia());
			adicionarResposta(document, "Principais interesses e potencialidades", a.getInteressesPotencialidades());
			adicionarResposta(document, "Atividades de que mais gosta", a.getAtividadesPreferidas());
			adicionarResposta(document, "Dificuldade importante", a.getDificuldadeImportante());
			adicionarResposta(document, "Orientacao importante para a escola", a.getOrientacaoEscola());

			adicionarSecao(document, "4. Saude");
			if (a.getDiagnosticos().isEmpty()) {
				adicionarResposta(document, "Diagnosticos", null);
			} else {
				var tabela = document.createTable();
				cabecalho(tabela, "Diagnostico", "CID");
				a.getDiagnosticos().forEach(item -> linha(tabela, item.getComprometimento(), item.getCid()));
			}
			adicionarResposta(document, "Faz uso de medicacao?", simNao(a.getUsaMedicacao()));
			if (!a.getMedicamentos().isEmpty()) {
				var tabela = document.createTable();
				cabecalho(tabela, "Medicamento", "Dosagem", "Observacao");
				a.getMedicamentos().forEach(item -> linha(tabela, item.getNome(), item.getDosagem(), item.getObservacoes()));
			}
			adicionarResposta(document, "Terapias", a.getTerapias().stream().map(item -> item.getTipo()).reduce((x, y) -> x + ", " + y).orElse(null));
			adicionarResposta(document, "Outra terapia", a.getTerapiaOutra());
			adicionarResposta(document, "Alergias", a.getAlergias());
			adicionarResposta(document, "Restricoes alimentares", a.getRestricoesAlimentares());

			adicionarSecao(document, "5. Comunicacao");
			adicionarResposta(document, "Como o aluno se comunica?", combinar(a.getComunicacaoTipo(), a.getComunicacaoOutra()));
			adicionarResposta(document, "Como demonstra que precisa de ajuda?", a.getComoPedeAjuda());

			adicionarSecao(document, "6. Escola");
			adicionarResposta(document, "Como foi a adaptacao escolar?", a.getAdaptacaoEscolar());
			adicionarResposta(document, "Estrategias que costumam funcionar", a.getEstrategiasFuncionam());
			adicionarResposta(document, "Recomendacao do professor anterior", a.getRecomendacaoProfessorAnterior());
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
		try {
			var logo = criarLogo();
			titulo.createRun().addPicture(new java.io.ByteArrayInputStream(logo),
					XWPFDocument.PICTURE_TYPE_PNG, "logo-elovia.png", Units.toEMU(150), Units.toEMU(42));
		} catch (Exception ignored) {
			// O titulo textual abaixo mantém a identidade mesmo se a imagem não puder ser renderizada.
		}
		var tituloRun = titulo.createRun();
		tituloRun.setText("\nELOVIA");
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

	private String combinarLista(String lista, String outro) {
		var valores = lista == null ? null : lista.replace("\n", ", ");
		return combinar(valores, outro);
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
