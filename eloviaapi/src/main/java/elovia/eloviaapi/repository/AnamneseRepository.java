package elovia.eloviaapi.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import elovia.eloviaapi.model.Anamnese;

public interface AnamneseRepository extends JpaRepository<Anamnese, UUID> {
	Optional<Anamnese> findByAlunoId(UUID alunoId);
}
