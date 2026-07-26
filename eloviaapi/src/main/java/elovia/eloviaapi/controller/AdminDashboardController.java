package elovia.eloviaapi.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import elovia.eloviaapi.dto.DashboardAdminResponse;
import elovia.eloviaapi.model.Role;
import elovia.eloviaapi.repository.AlunoRepository;
import elovia.eloviaapi.repository.UsuarioRepository;

@RestController
@RequestMapping({"/api/admin/dashboard", "/admin/dashboard"})
public class AdminDashboardController {

	private final AlunoRepository alunoRepository;
	private final UsuarioRepository usuarioRepository;

	public AdminDashboardController(AlunoRepository alunoRepository, UsuarioRepository usuarioRepository) {
		this.alunoRepository = alunoRepository;
		this.usuarioRepository = usuarioRepository;
	}

	@GetMapping
	public DashboardAdminResponse summary() {
		return new DashboardAdminResponse(
				alunoRepository.countByAtivoTrue(),
				usuarioRepository.countByRoleAndAtivoTrue(Role.MEDIADOR),
				alunoRepository.countAlunosSemMediador());
	}
}
