package elovia.eloviaapi.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import elovia.eloviaapi.dto.AlunoRequest;
import elovia.eloviaapi.dto.AlunoResponse;
import elovia.eloviaapi.exception.NotFoundException;
import elovia.eloviaapi.model.Aluno;
import elovia.eloviaapi.repository.AlunoRepository;

@Service
public class AlunoService {

	private final AlunoRepository alunoRepository;

	public AlunoService(AlunoRepository alunoRepository) {
		this.alunoRepository = alunoRepository;
	}

	public List<AlunoResponse> findAll() {
		return alunoRepository.findByAtivoTrueOrderByNomeAsc().stream()
				.map(AlunoResponse::from)
				.toList();
	}

	public AlunoResponse findById(UUID id) {
		return AlunoResponse.from(findEntityById(id));
	}

	@Transactional
	public AlunoResponse create(AlunoRequest request) {
		var aluno = new Aluno();
		aluno.setNome(request.nome());
		aluno.setTurma(request.turma());
		aluno.setObservacoes(request.observacoes());
		return AlunoResponse.from(alunoRepository.save(aluno));
	}

	@Transactional
	public AlunoResponse update(UUID id, AlunoRequest request) {
		var aluno = findEntityById(id);
		aluno.setNome(request.nome());
		aluno.setTurma(request.turma());
		aluno.setObservacoes(request.observacoes());
		return AlunoResponse.from(aluno);
	}

	@Transactional
	public void archive(UUID id) {
		var aluno = findEntityById(id);
		aluno.setAtivo(false);
	}

	Aluno findEntityById(UUID id) {
		return alunoRepository.findById(id)
				.filter(Aluno::isAtivo)
				.orElseThrow(() -> new NotFoundException("Aluno nao encontrado"));
	}
}
