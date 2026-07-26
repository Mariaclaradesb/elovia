package elovia.eloviaapi.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import elovia.eloviaapi.dto.AlunoRequest;
import elovia.eloviaapi.dto.AlunoResponse;
import elovia.eloviaapi.service.AlunoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/alunos")
public class AlunoController {

	private final AlunoService alunoService;

	public AlunoController(AlunoService alunoService) {
		this.alunoService = alunoService;
	}

	@GetMapping
	public List<AlunoResponse> findAll() {
		return alunoService.findAll();
	}

	@GetMapping("/{id}")
	public AlunoResponse findById(@PathVariable UUID id) {
		return alunoService.findById(id);
	}

	@PostMapping
	public ResponseEntity<AlunoResponse> create(@Valid @RequestBody AlunoRequest request) {
		var response = alunoService.create(request);
		return ResponseEntity.created(URI.create("/api/alunos/" + response.id())).body(response);
	}

	@PutMapping("/{id}")
	public AlunoResponse update(@PathVariable UUID id, @Valid @RequestBody AlunoRequest request) {
		return alunoService.update(id, request);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> archive(@PathVariable UUID id) {
		alunoService.archive(id);
		return ResponseEntity.noContent().build();
	}
}
