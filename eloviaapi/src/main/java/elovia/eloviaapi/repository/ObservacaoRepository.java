package elovia.eloviaapi.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import elovia.eloviaapi.model.Observacao;

public interface ObservacaoRepository extends JpaRepository<Observacao, UUID> {

	List<Observacao> findBySessaoIdOrderByCreatedAtDesc(UUID sessaoId);

	long countBySessaoIdAndAlunoId(UUID sessaoId, UUID alunoId);
}
