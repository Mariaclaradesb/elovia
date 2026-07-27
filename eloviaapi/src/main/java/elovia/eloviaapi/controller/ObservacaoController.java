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

import elovia.eloviaapi.dto.ObservacaoRequest;
import elovia.eloviaapi.dto.ObservacaoResponse;
import elovia.eloviaapi.service.ObservacaoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping
public class ObservacaoController {

	private final ObservacaoService observacaoService;

	public ObservacaoController(ObservacaoService observacaoService) {
		this.observacaoService = observacaoService;
	}

	@GetMapping({"/api/sessoes/{sessaoId}/timeline", "/sessoes/{sessaoId}/timeline"})
	public List<ObservacaoResponse> timeline(@PathVariable UUID sessaoId) {
		return observacaoService.findTimeline(sessaoId);
	}

	@PostMapping({"/api/observacoes", "/observacoes"})
	public ResponseEntity<ObservacaoResponse> create(@Valid @RequestBody ObservacaoRequest request) {
		var response = observacaoService.create(request);
		return ResponseEntity.created(URI.create("/api/observacoes/" + response.id())).body(response);
	}

	@PutMapping({"/api/observacoes/{id}", "/observacoes/{id}"})
	public ObservacaoResponse update(@PathVariable UUID id, @Valid @RequestBody ObservacaoRequest request) {
		return observacaoService.update(id, request);
	}

	@DeleteMapping({"/api/observacoes/{id}", "/observacoes/{id}"})
	public ResponseEntity<Void> delete(@PathVariable UUID id) {
		observacaoService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
