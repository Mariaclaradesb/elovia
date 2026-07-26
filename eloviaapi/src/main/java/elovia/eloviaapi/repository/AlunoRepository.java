package elovia.eloviaapi.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import elovia.eloviaapi.model.Aluno;

public interface AlunoRepository extends JpaRepository<Aluno, UUID> {

	List<Aluno> findByAtivoTrueOrderByNomeAsc();

	long countByAtivoTrue();

	@Query("select count(a) from Aluno a where a.ativo = true and a.mediadores is empty")
	long countAlunosSemMediador();
}
