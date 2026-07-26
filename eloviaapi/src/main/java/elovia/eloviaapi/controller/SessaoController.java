package elovia.eloviaapi.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import elovia.eloviaapi.dto.EventoRequest;
import elovia.eloviaapi.dto.EventoResponse;
import elovia.eloviaapi.dto.SessaoRequest;
import elovia.eloviaapi.dto.SessaoResponse;
import elovia.eloviaapi.service.EventoService;
import elovia.eloviaapi.service.SessaoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/sessoes")
public class SessaoController {

	private final SessaoService sessaoService;
	private final EventoService eventoService;

	public SessaoController(SessaoService sessaoService, EventoService eventoService) {
		this.sessaoService = sessaoService;
		this.eventoService = eventoService;
	}

	@GetMapping("/aluno/{alunoId}")
	public List<SessaoResponse> findByAluno(@PathVariable UUID alunoId) {
		return sessaoService.findByAluno(alunoId);
	}

	@PostMapping
	public ResponseEntity<SessaoResponse> create(@Valid @RequestBody SessaoRequest request) {
		var response = sessaoService.create(request);
		return ResponseEntity.created(URI.create("/api/sessoes/" + response.id())).body(response);
	}

	@PatchMapping("/{id}/finalizar")
	public SessaoResponse finish(@PathVariable UUID id) {
		return sessaoService.finish(id);
	}

	@GetMapping("/{sessaoId}/eventos")
	public List<EventoResponse> findEventos(@PathVariable UUID sessaoId) {
		return eventoService.findBySessao(sessaoId);
	}

	@PostMapping("/{sessaoId}/eventos")
	public ResponseEntity<EventoResponse> createEvento(
			@PathVariable UUID sessaoId,
			@Valid @RequestBody EventoRequest request) {
		var response = eventoService.create(sessaoId, request);
		return ResponseEntity.created(URI.create("/api/sessoes/" + sessaoId + "/eventos/" + response.id()))
				.body(response);
	}
}
