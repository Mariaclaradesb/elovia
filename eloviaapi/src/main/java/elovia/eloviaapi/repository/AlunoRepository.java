package elovia.eloviaapi.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import elovia.eloviaapi.model.Aluno;

public interface AlunoRepository extends JpaRepository<Aluno, UUID> {

	List<Aluno> findByAtivoTrueOrderByNomeAsc();
}
