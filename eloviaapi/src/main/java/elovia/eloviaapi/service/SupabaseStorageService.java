package elovia.eloviaapi.service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import elovia.eloviaapi.exception.BusinessException;

@Service
public class SupabaseStorageService {

	private final HttpClient httpClient = HttpClient.newHttpClient();
	private final String supabaseUrl;
	private final String serviceRoleKey;
	private final String bucket;

	public SupabaseStorageService(
			@Value("${app.supabase.url:}") String supabaseUrl,
			@Value("${app.supabase.service-role-key:}") String serviceRoleKey,
			@Value("${app.supabase.storage-bucket:documentos-alunos}") String bucket) {
		this.supabaseUrl = trimTrailingSlash(supabaseUrl);
		this.serviceRoleKey = serviceRoleKey;
		this.bucket = bucket;
	}

	public String upload(String caminho, MultipartFile arquivo) {
		try {
			return upload(
					caminho,
					arquivo.getBytes(),
					arquivo.getContentType() != null ? arquivo.getContentType() : "application/octet-stream");
		} catch (IOException exception) {
			throw new BusinessException("Nao foi possivel ler o arquivo enviado");
		}
	}

	public String upload(String caminho, byte[] conteudo, String contentType) {
		if (supabaseUrl.isBlank() || serviceRoleKey.isBlank()) {
			throw new BusinessException("Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para enviar arquivos");
		}

		try {
			var uri = URI.create(supabaseUrl + "/storage/v1/object/" + bucket + "/" + encodePath(caminho));
			var request = HttpRequest.newBuilder(uri)
					.header("Authorization", "Bearer " + serviceRoleKey)
					.header("apikey", serviceRoleKey)
					.header("x-upsert", "true")
					.header("Content-Type", contentType != null ? contentType : "application/octet-stream")
					.PUT(HttpRequest.BodyPublishers.ofByteArray(conteudo))
					.build();

			var response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw new BusinessException("Erro ao enviar arquivo para o Supabase Storage: " + response.body());
			}
			return publicUrl(caminho);
		} catch (IOException exception) {
			throw new BusinessException("Nao foi possivel enviar o arquivo ao Supabase Storage");
		} catch (InterruptedException exception) {
			Thread.currentThread().interrupt();
			throw new BusinessException("Envio de arquivo interrompido");
		}
	}

	public String publicUrl(String caminho) {
		return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + encodePath(caminho);
	}

	private String trimTrailingSlash(String value) {
		if (value == null) return "";
		return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
	}

	private String encodePath(String caminho) {
		return URLEncoder.encode(caminho, StandardCharsets.UTF_8).replace("+", "%20").replace("%2F", "/");
	}
}
