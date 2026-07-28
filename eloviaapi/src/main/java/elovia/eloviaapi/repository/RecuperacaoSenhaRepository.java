package elovia.eloviaapi.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import elovia.eloviaapi.model.RecuperacaoSenha;

public interface RecuperacaoSenhaRepository extends JpaRepository<RecuperacaoSenha, UUID> {

	Optional<RecuperacaoSenha> findByUsuarioId(UUID usuarioId);

	void deleteByUsuarioId(UUID usuarioId);
}
