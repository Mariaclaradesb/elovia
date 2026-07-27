package elovia.eloviaapi.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import elovia.eloviaapi.model.SessaoAcompanhamento;

public interface SessaoAcompanhamentoRepository extends JpaRepository<SessaoAcompanhamento, UUID> {

	List<SessaoAcompanhamento> findByAlunoIdOrderByIniciadaEmDesc(UUID alunoId);

	List<SessaoAcompanhamento> findByMediadorIdOrderByInicioDesc(UUID mediadorId);

	Optional<SessaoAcompanhamento> findFirstByMediadorIdAndStatusOrderByInicioDesc(UUID mediadorId, elovia.eloviaapi.model.StatusSessao status);

	List<SessaoAcompanhamento> findByAlunosIdOrderByInicioDesc(UUID alunoId);
}
