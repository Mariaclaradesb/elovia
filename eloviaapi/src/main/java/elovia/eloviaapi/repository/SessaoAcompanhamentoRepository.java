package elovia.eloviaapi.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;

import elovia.eloviaapi.model.SessaoAcompanhamento;

public interface SessaoAcompanhamentoRepository extends JpaRepository<SessaoAcompanhamento, UUID> {

	List<SessaoAcompanhamento> findByAlunoIdOrderByIniciadaEmDesc(UUID alunoId);

	List<SessaoAcompanhamento> findByMediadorIdOrderByInicioDesc(UUID mediadorId);

	List<SessaoAcompanhamento> findByMediadorAdministradorIdOrderByInicioDesc(UUID administradorId);

	Optional<SessaoAcompanhamento> findFirstByMediadorIdAndStatusOrderByInicioDesc(UUID mediadorId, elovia.eloviaapi.model.StatusSessao status);

	List<SessaoAcompanhamento> findByAlunosIdOrderByInicioDesc(UUID alunoId);

	@Query("""
		select distinct s from SessaoAcompanhamento s left join s.alunos a
		where (s.aluno.id = :alunoId or a.id = :alunoId) and s.data between :inicio and :fim
		order by s.data asc, s.inicio asc
		""")
	List<SessaoAcompanhamento> findRelatorioMensal(@Param("alunoId") UUID alunoId,
			@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
