package elovia.eloviaapi.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import elovia.eloviaapi.model.DocumentoAluno;

public interface DocumentoAlunoRepository extends JpaRepository<DocumentoAluno, UUID> {

	List<DocumentoAluno> findByAlunoIdOrderByDataUploadDesc(UUID alunoId);
}
