package elovia.eloviaapi.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import elovia.eloviaapi.exception.NotFoundException;
import elovia.eloviaapi.model.Usuario;
import elovia.eloviaapi.repository.UsuarioRepository;
import elovia.eloviaapi.security.AuthenticatedUser;

@Service
public class CurrentUserService {

	private final UsuarioRepository usuarioRepository;

	public CurrentUserService(UsuarioRepository usuarioRepository) {
		this.usuarioRepository = usuarioRepository;
	}

	public Usuario getCurrentUser() {
		var auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser user)) {
			throw new NotFoundException("Usuario autenticado nao encontrado");
		}
		return usuarioRepository.findById(user.id())
				.orElseThrow(() -> new NotFoundException("Usuario autenticado nao encontrado"));
	}
}
