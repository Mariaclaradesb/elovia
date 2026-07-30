package elovia.eloviaapi.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import elovia.eloviaapi.dto.AnamneseHistoricoResponse;
import elovia.eloviaapi.dto.AnamnesePesquisaResponse;
import elovia.eloviaapi.dto.AnamneseRequest;
import elovia.eloviaapi.dto.AnamneseResponse;
import elovia.eloviaapi.dto.DocumentoAlunoResponse;
import elovia.eloviaapi.model.CategoriaDocumento;
import elovia.eloviaapi.service.AnamneseService;

@RestController
@RequestMapping("/api/alunos/{alunoId}/anamnese")
public class AnamneseController {

	private final AnamneseService service;

	public AnamneseController(AnamneseService service) {
		this.service = service;
	}

	@GetMapping
	public AnamneseResponse buscar(@PathVariable UUID alunoId) {
		return service.buscar(alunoId);
	}

	@PutMapping("/etapas/{etapa}")
	public AnamneseResponse salvarEtapa(
			@PathVariable UUID alunoId,
			@PathVariable int etapa,
			@RequestBody AnamneseRequest request) {
		return service.salvarEtapa(alunoId, etapa, request);
	}

	@GetMapping("/pesquisa")
	public List<AnamnesePesquisaResponse> pesquisar(
			@PathVariable UUID alunoId,
			@RequestParam(defaultValue = "") String q) {
		return service.pesquisar(alunoId, q);
	}

	@GetMapping("/historico")
	public List<AnamneseHistoricoResponse> historico(@PathVariable UUID alunoId) {
		return service.historico(alunoId);
	}

	@PostMapping(value = "/anexos", consumes = "multipart/form-data")
	@ResponseStatus(HttpStatus.CREATED)
	public DocumentoAlunoResponse anexar(
			@PathVariable UUID alunoId,
			@RequestParam String titulo,
			@RequestParam(required = false) String descricao,
			@RequestParam CategoriaDocumento categoria,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataDocumento,
			@RequestParam(required = false) MultipartFile arquivo) {
		return service.anexar(alunoId, titulo, descricao, categoria, dataDocumento, arquivo);
	}

	@PostMapping("/relatorio")
	@ResponseStatus(HttpStatus.CREATED)
	public DocumentoAlunoResponse gerarRelatorio(@PathVariable UUID alunoId) {
		return service.gerarRelatorio(alunoId);
	}
}
