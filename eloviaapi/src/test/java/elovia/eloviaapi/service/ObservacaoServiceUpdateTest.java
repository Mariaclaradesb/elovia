package elovia.eloviaapi.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import elovia.eloviaapi.dto.ObservacaoRequest;
import elovia.eloviaapi.exception.BusinessException;
import elovia.eloviaapi.model.Aluno;
import elovia.eloviaapi.model.CategoriaObservacao;
import elovia.eloviaapi.model.Observacao;
import elovia.eloviaapi.model.SessaoAcompanhamento;
import elovia.eloviaapi.model.StatusSessao;
import elovia.eloviaapi.model.TipoRegistro;
import elovia.eloviaapi.repository.ObservacaoRepository;

class ObservacaoServiceUpdateTest {

	private ObservacaoRepository repository;
	private SessaoService sessaoService;
	private ObservacaoService service;
	private Observacao observacao;
	private SessaoAcompanhamento sessao;
	private Aluno aluno;
	private UUID observacaoId;
	private UUID sessaoId;
	private UUID alunoId;

	@BeforeEach
	void setUp() {
		repository = mock(ObservacaoRepository.class);
		sessaoService = mock(SessaoService.class);
		service = new ObservacaoService(
				repository,
				sessaoService,
				mock(AlunoService.class),
				mock(FotoPerfilService.class));

		observacaoId = UUID.randomUUID();
		sessaoId = UUID.randomUUID();
		alunoId = UUID.randomUUID();
		observacao = mock(Observacao.class);
		sessao = mock(SessaoAcompanhamento.class);
		aluno = mock(Aluno.class);

		when(repository.findById(observacaoId)).thenReturn(Optional.of(observacao));
		when(observacao.getId()).thenReturn(observacaoId);
		when(observacao.getSessao()).thenReturn(sessao);
		when(observacao.getAluno()).thenReturn(aluno);
		when(sessao.getId()).thenReturn(sessaoId);
		when(sessao.getStatus()).thenReturn(StatusSessao.FINALIZADA);
		when(aluno.getId()).thenReturn(alunoId);
		when(sessaoService.findEntityById(sessaoId)).thenReturn(sessao);
	}

	@Test
	void deveEditarRegistroDeAtendimentoFinalizado() {
		var request = request(sessaoId, alunoId, "Texto revisado");

		service.update(observacaoId, request);

		verify(observacao).setDescricao("Texto revisado");
		verify(observacao).setDisciplina("Matematica");
		verify(observacao).setCategoria(CategoriaObservacao.ATIVIDADE);
	}

	@Test
	void naoDeveMoverRegistroParaOutroAtendimento() {
		var request = request(UUID.randomUUID(), alunoId, "Texto revisado");

		assertThrows(BusinessException.class, () -> service.update(observacaoId, request));
	}

	@Test
	void naoDeveMoverRegistroParaOutroAluno() {
		var request = request(sessaoId, UUID.randomUUID(), "Texto revisado");

		assertThrows(BusinessException.class, () -> service.update(observacaoId, request));
	}

	private ObservacaoRequest request(UUID requestSessaoId, UUID requestAlunoId, String descricao) {
		return new ObservacaoRequest(
				requestSessaoId,
				requestAlunoId,
				CategoriaObservacao.ATIVIDADE,
				descricao,
				"Matematica",
				null,
				null,
				null,
				null,
				TipoRegistro.MANUAL,
				null);
	}
}
