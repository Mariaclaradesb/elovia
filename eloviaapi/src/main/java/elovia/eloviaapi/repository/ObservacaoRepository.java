package elovia.eloviaapi.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;

import elovia.eloviaapi.model.Observacao;

public interface ObservacaoRepository extends JpaRepository<Observacao, UUID> {

	List<Observacao> findBySessaoIdOrderByCreatedAtDesc(UUID sessaoId);

	long countBySessaoIdAndAlunoId(UUID sessaoId, UUID alunoId);

	@Query("""
		select o from Observacao o join o.sessao s
		where o.aluno.id = :alunoId and s.data between :inicio and :fim
		order by o.createdAt asc
		""")
	List<Observacao> findRelatorioMensal(@Param("alunoId") UUID alunoId,
			@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
