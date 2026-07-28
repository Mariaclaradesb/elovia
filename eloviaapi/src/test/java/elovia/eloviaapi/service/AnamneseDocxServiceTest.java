package elovia.eloviaapi.service;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.ByteArrayInputStream;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.junit.jupiter.api.Test;

import elovia.eloviaapi.model.Aluno;
import elovia.eloviaapi.model.Anamnese;

class AnamneseDocxServiceTest {

	@Test
	void geraDocumentoWordComSecoesInstitucionais() throws Exception {
		var aluno = new Aluno();
		aluno.setNome("Aluno de Teste");
		aluno.setEscola("Escola Elovia");
		aluno.setTurma("5 ano A");
		aluno.setTurno("Matutino");

		var anamnese = new Anamnese();
		anamnese.setAluno(aluno);
		anamnese.setQuemEAluno("Aluno comunicativo e participativo.");
		anamnese.setPotencialidades("Boa memoria visual.");
		anamnese.setRotinaCasa("Rotina organizada com a familia.");
		anamnese.setProfessorRegente("Observacao da professora regente.");

		var service = new AnamneseDocxService(null, null, null);
		var bytes = service.criarDocumento(anamnese);
		assertTrue(bytes.length > 1000);

		try (var document = new XWPFDocument(new ByteArrayInputStream(bytes))) {
			var text = new StringBuilder();
			document.getParagraphs().forEach(paragraph -> text.append(paragraph.getText()).append('\n'));
			document.getTables().forEach(table -> text.append(table.getText()).append('\n'));
			assertTrue(text.toString().contains("RELATORIO DE ANAMNESE DO ALUNO"));
			assertTrue(text.toString().contains("Aluno de Teste"));
			assertTrue(text.toString().contains("5. Perfil pedagogico"));
			assertTrue(text.toString().contains("7. Observacoes da escola"));
		}
	}
}
