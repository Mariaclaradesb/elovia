package elovia.eloviaapi.controller;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import elovia.eloviaapi.dto.DocumentoLinkResponse;
import elovia.eloviaapi.dto.DocumentoAlunoResponse;
import elovia.eloviaapi.model.CategoriaDocumento;
import elovia.eloviaapi.service.DocumentoAlunoService;

@RestController
@RequestMapping
public class DocumentoAlunoController {

	private final DocumentoAlunoService documentoService;

	public DocumentoAlunoController(DocumentoAlunoService documentoService) {
		this.documentoService = documentoService;
	}

	@GetMapping({"/api/alunos/{alunoId}/documentos", "/alunos/{alunoId}/documentos"})
	public List<DocumentoAlunoResponse> listarPorAluno(@PathVariable UUID alunoId) {
		return documentoService.listarPorAluno(alunoId);
	}

	@PostMapping({"/api/alunos/{alunoId}/documentos", "/alunos/{alunoId}/documentos"})
	public ResponseEntity<DocumentoAlunoResponse> criar(
			@PathVariable UUID alunoId,
			@RequestParam String titulo,
			@RequestParam(required = false) String descricao,
			@RequestParam CategoriaDocumento categoria,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataDocumento,
			@RequestParam MultipartFile arquivo) {
		var response = documentoService.criar(alunoId, titulo, descricao, categoria, dataDocumento, arquivo);
		return ResponseEntity.created(URI.create("/api/documentos/" + response.id())).body(response);
	}

	@GetMapping({"/api/documentos/{id}", "/documentos/{id}"})
	public DocumentoAlunoResponse buscarPorId(@PathVariable UUID id) {
		return documentoService.buscarPorId(id);
	}

	@PutMapping({"/api/documentos/{id}", "/documentos/{id}"})
	public DocumentoAlunoResponse atualizar(
			@PathVariable UUID id,
			@RequestParam String titulo,
			@RequestParam(required = false) String descricao,
			@RequestParam CategoriaDocumento categoria,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataDocumento,
			@RequestParam(required = false) MultipartFile arquivo) {
		return documentoService.atualizar(id, titulo, descricao, categoria, dataDocumento, arquivo);
	}

	@DeleteMapping({"/api/documentos/{id}", "/documentos/{id}"})
	public ResponseEntity<Void> desativar(@PathVariable UUID id) {
		documentoService.desativar(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping({"/api/documentos/download/{id}", "/documentos/download/{id}"})
	public ResponseEntity<Void> download(@PathVariable UUID id) {
		return ResponseEntity.status(302)
				.location(URI.create(documentoService.obterUrlDownload(id)))
				.build();
	}

	@GetMapping({"/api/documentos/link/{id}", "/documentos/link/{id}"})
	public DocumentoLinkResponse link(@PathVariable UUID id) {
		return documentoService.obterLinkSeguro(id);
	}
}
