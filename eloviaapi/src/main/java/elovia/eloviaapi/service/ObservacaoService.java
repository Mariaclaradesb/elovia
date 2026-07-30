package elovia.eloviaapi.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import elovia.eloviaapi.dto.ObservacaoRequest;
import elovia.eloviaapi.dto.ObservacaoResponse;
import elovia.eloviaapi.exception.BusinessException;
import elovia.eloviaapi.exception.NotFoundException;
import elovia.eloviaapi.model.Observacao;
import elovia.eloviaapi.model.StatusSessao;
import elovia.eloviaapi.model.TipoRegistro;
import elovia.eloviaapi.repository.ObservacaoRepository;

@Service
public class ObservacaoService {

	private final ObservacaoRepository observacaoRepository;
	private final SessaoService sessaoService;
	private final AlunoService alunoService;
	private final FotoPerfilService fotoPerfilService;

	public ObservacaoService(
			ObservacaoRepository observacaoRepository,
			SessaoService sessaoService,
			AlunoService alunoService,
			FotoPerfilService fotoPerfilService) {
		this.observacaoRepository = observacaoRepository;
		this.sessaoService = sessaoService;
		this.alunoService = alunoService;
		this.fotoPerfilService = fotoPerfilService;
	}

	@Transactional(readOnly = true)
	public List<ObservacaoResponse> findTimeline(UUID sessaoId) {
		sessaoService.findEntityById(sessaoId);
		return observacaoRepository.findBySessaoIdOrderByCreatedAtDesc(sessaoId).stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional
	public ObservacaoResponse create(ObservacaoRequest request) {
		var sessao = sessaoService.findEntityById(request.sessaoId());
		if (sessao.getStatus() != StatusSessao.ABERTA) {
			throw new BusinessException("Sessao encerrada não permite novas observacoes");
		}
		if (!sessaoService.alunoPertenceASessao(sessao, request.alunoId())) {
			throw new BusinessException("Aluno não pertence a sessao");
		}

		var observacao = new Observacao();
		observacao.setSessao(sessao);
		observacao.setAluno(alunoService.findEntityById(request.alunoId()));
		fill(observacao, request);
		return toResponse(observacaoRepository.save(observacao));
	}

	@Transactional
	public ObservacaoResponse update(UUID id, ObservacaoRequest request) {
		var observacao = findEntityById(id);
		if (observacao.getSessao().getStatus() != StatusSessao.ABERTA) {
			throw new BusinessException("Sessao encerrada não permite alteracoes");
		}
		if (!observacao.getAluno().getId().equals(request.alunoId())
				&& !sessaoService.alunoPertenceASessao(observacao.getSessao(), request.alunoId())) {
			throw new BusinessException("Aluno não pertence a sessao");
		}
		observacao.setAluno(alunoService.findEntityById(request.alunoId()));
		fill(observacao, request);
		return toResponse(observacao);
	}

	@Transactional
	public void delete(UUID id) {
		var observacao = findEntityById(id);
		if (observacao.getSessao().getStatus() != StatusSessao.ABERTA) {
			throw new BusinessException("Sessao encerrada não permite exclusao");
		}
		observacaoRepository.delete(observacao);
	}

	@Transactional(readOnly = true)
	public Observacao findEntityById(UUID id) {
		var observacao = observacaoRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Observacao não encontrada"));
		sessaoService.findEntityById(observacao.getSessao().getId());
		return observacao;
	}

	private void fill(Observacao observacao, ObservacaoRequest request) {
		observacao.setCategoria(request.categoria());
		observacao.setDescricao(request.descricao());
		observacao.setDisciplina(request.disciplina());
		observacao.setLocal(request.local());
		observacao.setEstrategia(request.estrategia());
		observacao.setResultado(request.resultado());
		observacao.setObservacaoComplementar(request.observacaoComplementar());
		observacao.setTipoRegistro(request.tipoRegistro() != null ? request.tipoRegistro() : TipoRegistro.MANUAL);
		observacao.setAudioUrl(request.audioUrl());
	}

	private ObservacaoResponse toResponse(Observacao observacao) {
		return ObservacaoResponse.from(observacao, fotoPerfilService.urlAcessivel(observacao.getAluno().getFoto()));
	}
}
