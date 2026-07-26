package elovia.eloviaapi.dto;

import elovia.eloviaapi.model.TipoEvento;
import jakarta.validation.constraints.NotNull;

public record EventoRequest(
		@NotNull TipoEvento tipo,
		String observacoes) {
}
