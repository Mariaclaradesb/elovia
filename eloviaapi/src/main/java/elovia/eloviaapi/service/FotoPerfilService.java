package elovia.eloviaapi.service;

import java.time.Duration;

import org.springframework.stereotype.Service;

@Service
public class FotoPerfilService {

	private static final Duration FOTO_PERFIL_VALIDADE = Duration.ofDays(7);

	private final SupabaseStorageService storageService;

	public FotoPerfilService(SupabaseStorageService storageService) {
		this.storageService = storageService;
	}

	public String urlAcessivel(String foto) {
		if (foto == null || foto.isBlank()) {
			return foto;
		}
		return storageService.signedUrlFromReference(foto, FOTO_PERFIL_VALIDADE);
	}
}
