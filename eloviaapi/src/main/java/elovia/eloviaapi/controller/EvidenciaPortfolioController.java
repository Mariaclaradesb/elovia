package elovia.eloviaapi.controller;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import elovia.eloviaapi.dto.EvidenciaPortfolioResponse;
import elovia.eloviaapi.model.StatusAtividadePortfolio;
import elovia.eloviaapi.model.TipoAtividadePortfolio;
import elovia.eloviaapi.service.EvidenciaPortfolioService;

@RestController
@RequestMapping("/api")
public class EvidenciaPortfolioController {
	private final EvidenciaPortfolioService service;
	public EvidenciaPortfolioController(EvidenciaPortfolioService service) { this.service = service; }

	@GetMapping({"/alunos/{alunoId}/portfolio/evidencias", "/alunos/{alunoId}/portfolio/timeline"})
	public List<EvidenciaPortfolioResponse> list(@PathVariable UUID alunoId) { return service.list(alunoId); }

	@GetMapping("/portfolio/evidencias/{id}")
	public EvidenciaPortfolioResponse find(@PathVariable UUID id) { return service.find(id); }

	@PostMapping("/alunos/{alunoId}/portfolio/evidencias")
	public ResponseEntity<EvidenciaPortfolioResponse> create(@PathVariable UUID alunoId,
			@RequestParam String disciplina, @RequestParam(required = false) String titulo,
			@RequestParam(required = false) TipoAtividadePortfolio tipoAtividade,
			@RequestParam(required = false) StatusAtividadePortfolio statusAtividade,
			@RequestParam(required = false) String descricao,
			@RequestParam(required = false) String observacoesComplementares,
			@RequestParam(required = false) String tags,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime horario,
			@RequestParam MultipartFile foto) {
		var result = service.create(alunoId, disciplina, titulo, tipoAtividade, statusAtividade,
				descricao, observacoesComplementares, tags, data, horario, foto);
		return ResponseEntity.created(URI.create("/api/portfolio/evidencias/" + result.id())).body(result);
	}

	@PutMapping("/portfolio/evidencias/{id}")
	public EvidenciaPortfolioResponse update(@PathVariable UUID id,
			@RequestParam String disciplina, @RequestParam(required = false) String titulo,
			@RequestParam(required = false) TipoAtividadePortfolio tipoAtividade,
			@RequestParam(required = false) StatusAtividadePortfolio statusAtividade,
			@RequestParam(required = false) String descricao,
			@RequestParam(required = false) String observacoesComplementares,
			@RequestParam(required = false) String tags,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime horario,
			@RequestParam(required = false) MultipartFile foto) {
		return service.update(id, disciplina, titulo, tipoAtividade, statusAtividade,
				descricao, observacoesComplementares, tags, data, horario, foto);
	}

	@DeleteMapping("/portfolio/evidencias/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id) {
		service.delete(id);
		return ResponseEntity.noContent().build();
	}
}
