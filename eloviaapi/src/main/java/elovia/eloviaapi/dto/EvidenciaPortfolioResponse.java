package elovia.eloviaapi.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;
import java.util.UUID;
import elovia.eloviaapi.model.StatusAtividadePortfolio;
import elovia.eloviaapi.model.TipoAtividadePortfolio;

public record EvidenciaPortfolioResponse(
		UUID id, UUID alunoId, String alunoNome, UUID mediadorId, String mediadorNome,
		UUID cadastradoPorId, String cadastradoPorNome, String disciplina, String titulo,
		TipoAtividadePortfolio tipoAtividade, StatusAtividadePortfolio statusAtividade,
		String descricao, String observacoesComplementares, String fotoUrl, LocalDate data,
		LocalTime horario, Instant registradoEm, Instant criadoEm, Instant atualizadoEm,
		Set<String> tags) { }
