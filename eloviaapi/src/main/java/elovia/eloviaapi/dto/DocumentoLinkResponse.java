package elovia.eloviaapi.dto;

import java.time.Instant;

public record DocumentoLinkResponse(
		String urlArquivo,
		Instant expiraEm) {
}
