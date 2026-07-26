package elovia.eloviaapi.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import elovia.eloviaapi.dto.SessaoRequest;
import elovia.eloviaapi.dto.SessaoResponse;
import elovia.eloviaapi.exception.NotFoundException;
import elovia.eloviaapi.model.SessaoAcompanhamento;
import elovia.eloviaapi.model.StatusSessao;
import elovia.eloviaapi.repository.SessaoAcompanhamentoRepository;

@Service
public class SessaoService {

	private final SessaoAcompanhamentoRepository sessaoRepository;
	private final AlunoService alunoService;

	public SessaoService(SessaoAcompanhamentoRepository sessaoRepository, AlunoService alunoService) {
		this.sessaoRepository = sessaoRepository;
		this.alunoService = alunoService;
	}

	public List<SessaoResponse> findByAluno(UUID alunoId) {
		return sessaoRepository.findByAlunoIdOrderByIniciadaEmDesc(alunoId).stream()
				.map(SessaoResponse::from)
				.toList();
	}

	@Transactional
	public SessaoResponse create(SessaoRequest request) {
		var sessao = new SessaoAcompanhamento();
		sessao.setAluno(alunoService.findEntityById(request.alunoId()));
		sessao.setObservacoes(request.observacoes());
		return SessaoResponse.from(sessaoRepository.save(sessao));
	}

	@Transactional
	public SessaoResponse finish(UUID id) {
		var sessao = findEntityById(id);
		sessao.setStatus(StatusSessao.FINALIZADA);
		sessao.setFinalizadaEm(Instant.now());
		return SessaoResponse.from(sessao);
	}

	SessaoAcompanhamento findEntityById(UUID id) {
		return sessaoRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Sessao nao encontrada"));
	}
}
