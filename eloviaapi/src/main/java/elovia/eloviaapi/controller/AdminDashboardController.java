package elovia.eloviaapi.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import elovia.eloviaapi.dto.DashboardAdminResponse;
import elovia.eloviaapi.model.Role;
import elovia.eloviaapi.repository.AlunoRepository;
import elovia.eloviaapi.repository.UsuarioRepository;
import elovia.eloviaapi.service.CurrentUserService;

@RestController
@RequestMapping({"/api/admin/dashboard", "/admin/dashboard"})
public class AdminDashboardController {

	private final AlunoRepository alunoRepository;
	private final UsuarioRepository usuarioRepository;
	private final CurrentUserService currentUserService;

	public AdminDashboardController(AlunoRepository alunoRepository, UsuarioRepository usuarioRepository, CurrentUserService currentUserService) {
		this.alunoRepository = alunoRepository;
		this.usuarioRepository = usuarioRepository;
		this.currentUserService = currentUserService;
	}

	@GetMapping
	public DashboardAdminResponse summary() {
		var admin = currentUserService.getCurrentUser();
		return new DashboardAdminResponse(
				alunoRepository.countByAtivoTrueAndAdministradorId(admin.getId()),
				usuarioRepository.countByRoleAndAtivoTrueAndAdministradorId(Role.MEDIADOR, admin.getId()),
				alunoRepository.countAlunosSemMediadorByAdministradorId(admin.getId()));
	}
}
