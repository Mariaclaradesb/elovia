package elovia.eloviaapi.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import elovia.eloviaapi.model.Role;
import elovia.eloviaapi.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

	Optional<Usuario> findByEmailIgnoreCase(String email);

	Optional<Usuario> findByCpf(String cpf);

	boolean existsByEmailIgnoreCase(String email);

	boolean existsByCpf(String cpf);

	List<Usuario> findByRoleAndAtivoTrueOrderByNomeAsc(Role role);

	long countByRoleAndAtivoTrue(Role role);
}
