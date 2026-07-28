package elovia.eloviaapi.dto;

import java.time.Instant;
import java.util.UUID;
import elovia.eloviaapi.model.AnamneseHistorico;

public record AnamneseHistoricoResponse(UUID id, int etapa, String resumo, String usuarioNome, Instant editadoEm) {
	public static AnamneseHistoricoResponse from(AnamneseHistorico h) {
		return new AnamneseHistoricoResponse(h.getId(), h.getEtapa(), h.getResumo(),
				h.getUsuario() != null ? h.getUsuario().getNome() : null, h.getEditadoEm());
	}
}
