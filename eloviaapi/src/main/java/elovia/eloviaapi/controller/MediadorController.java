package elovia.eloviaapi.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import elovia.eloviaapi.dto.MediadorRequest;
import elovia.eloviaapi.dto.MediadorResponse;
import elovia.eloviaapi.service.MediadorService;
import jakarta.validation.Valid;

@RestController
@RequestMapping({"/api/mediadores", "/mediadores"})
public class MediadorController {

	private final MediadorService mediadorService;

	public MediadorController(MediadorService mediadorService) {
		this.mediadorService = mediadorService;
	}

	@GetMapping
	public List<MediadorResponse> findAll() {
		return mediadorService.findAll();
	}

	@GetMapping("/{id}")
	public MediadorResponse findById(@PathVariable UUID id) {
		return mediadorService.findById(id);
	}

	@PostMapping
	public ResponseEntity<MediadorResponse> create(@Valid @RequestBody MediadorRequest request) {
		var response = mediadorService.create(request);
		return ResponseEntity.created(URI.create("/api/mediadores/" + response.id())).body(response);
	}

	@PutMapping("/{id}")
	public MediadorResponse update(@PathVariable UUID id, @Valid @RequestBody MediadorRequest request) {
		return mediadorService.update(id, request);
	}

	@PatchMapping("/{id}/desativar")
	public ResponseEntity<Void> deactivate(@PathVariable UUID id) {
		mediadorService.deactivate(id);
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/{id}/redefinir-senha")
	public MediadorResponse resetPassword(@PathVariable UUID id) {
		return mediadorService.resetPassword(id);
	}
}
