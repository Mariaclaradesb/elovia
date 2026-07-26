package elovia.eloviaapi.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import elovia.eloviaapi.model.EventoAcompanhamento;

public interface EventoAcompanhamentoRepository extends JpaRepository<EventoAcompanhamento, UUID> {

	List<EventoAcompanhamento> findBySessaoIdOrderByOcorridoEmDesc(UUID sessaoId);
}
