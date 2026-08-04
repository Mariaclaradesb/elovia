package elovia.eloviaapi.controller;

import java.util.UUID;
import org.springframework.web.bind.annotation.*;
import elovia.eloviaapi.dto.RelatorioMensalResponse;
import elovia.eloviaapi.service.RelatorioMensalService;

@RestController
@RequestMapping("/api/alunos/{alunoId}/relatorios")
public class RelatorioMensalController {
	private final RelatorioMensalService service;
	public RelatorioMensalController(RelatorioMensalService service) { this.service = service; }

	@GetMapping("/mensal")
	public RelatorioMensalResponse monthly(@PathVariable UUID alunoId, @RequestParam int mes, @RequestParam int ano) {
		return service.generate(alunoId, mes, ano);
	}
}
