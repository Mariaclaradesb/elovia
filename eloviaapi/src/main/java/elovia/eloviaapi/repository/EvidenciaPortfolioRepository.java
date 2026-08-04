package elovia.eloviaapi.repository;

import java.util.List;
import java.util.UUID;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.JpaRepository;
import elovia.eloviaapi.model.EvidenciaPortfolio;

public interface EvidenciaPortfolioRepository extends JpaRepository<EvidenciaPortfolio, UUID> {
	List<EvidenciaPortfolio> findByAlunoIdAndAtivoTrueOrderByRegistradoEmDesc(UUID alunoId);
	List<EvidenciaPortfolio> findByAlunoIdAndAtivoTrueAndDataBetweenOrderByRegistradoEmAsc(UUID alunoId, LocalDate inicio, LocalDate fim);
}
