package elovia.eloviaapi.dto;

import java.time.Instant;
import java.util.UUID;

import elovia.eloviaapi.model.EventoAcompanhamento;
import elovia.eloviaapi.model.TipoEvento;

public record EventoResponse(
		UUID id,
		UUID sessaoId,
		TipoEvento tipo,
		String observacoes,
		Instant ocorridoEm) {

	public static EventoResponse from(EventoAcompanhamento evento) {
		return new EventoResponse(
				evento.getId(),
				evento.getSessao().getId(),
				evento.getTipo(),
				evento.getObservacoes(),
				evento.getOcorridoEm());
	}
}
