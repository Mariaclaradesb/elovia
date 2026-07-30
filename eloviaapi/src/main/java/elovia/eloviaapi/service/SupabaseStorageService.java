package elovia.eloviaapi.service;

import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.regex.Pattern;

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
	private static final Pattern SIGNED_URL_PATTERN = Pattern.compile("\"signedURL\"\\s*:\\s*\"([^\"]+)\"|\"signedUrl\"\\s*:\\s*\"([^\"]+)\"");

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

	public String signedUrl(String caminho, Duration validade) {
		if (supabaseUrl.isBlank() || serviceRoleKey.isBlank()) {
			throw new BusinessException("Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para acessar arquivos");
		}
		if (caminho == null || caminho.isBlank()) {
			throw new BusinessException("Arquivo sem caminho de armazenamento");
		}

		try {
			var uri = URI.create(supabaseUrl + "/storage/v1/object/sign/" + bucket + "/" + encodePath(caminho));
			var body = "{\"expiresIn\":" + validade.toSeconds() + "}";
			var request = HttpRequest.newBuilder(uri)
					.header("Authorization", "Bearer " + serviceRoleKey)
					.header("apikey", serviceRoleKey)
					.header("Content-Type", "application/json")
					.POST(HttpRequest.BodyPublishers.ofString(body))
					.build();

			var response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				throw new BusinessException("Erro ao gerar link seguro do arquivo: " + response.body());
			}

			var signedUrl = extractSignedUrl(response.body());
			if (signedUrl == null || signedUrl.isBlank()) {
				throw new BusinessException("Supabase Storage nao retornou o link seguro do arquivo");
			}
			return normalizeSignedUrl(signedUrl);
		} catch (IOException exception) {
			throw new BusinessException("Nao foi possivel gerar o link seguro do arquivo");
		} catch (InterruptedException exception) {
			Thread.currentThread().interrupt();
			throw new BusinessException("Geracao do link seguro interrompida");
		}
	}

	public String signedUrlFromReference(String referencia, Duration validade) {
		var caminho = storagePathFromReference(referencia);
		if (caminho == null || caminho.isBlank()) {
			return referencia;
		}
		if (supabaseUrl.isBlank() || serviceRoleKey.isBlank()) {
			return referencia;
		}
		return signedUrl(caminho, validade);
	}

	public String storagePathFromReference(String referencia) {
		if (referencia == null || referencia.isBlank()) return null;
		var value = referencia.trim();

		var publicPath = storagePathFromPublicUrl(value);
		if (publicPath != null) return publicPath;

		var signedPath = storagePathAfterMarker(value, "/storage/v1/object/sign/" + bucket + "/");
		if (signedPath != null) return signedPath;

		if (isStoragePath(value)) {
			return value.replaceFirst("^/+", "");
		}
		return null;
	}

	public String storagePathFromPublicUrl(String url) {
		if (url == null || url.isBlank()) return null;
		var marker = "/storage/v1/object/public/" + bucket + "/";
		return storagePathAfterMarker(url, marker);
	}

	private String extractSignedUrl(String body) {
		var matcher = SIGNED_URL_PATTERN.matcher(body);
		if (!matcher.find()) return null;
		var value = matcher.group(1) != null ? matcher.group(1) : matcher.group(2);
		return value.replace("\\/", "/");
	}

	private String trimTrailingSlash(String value) {
		if (value == null) return "";
		return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
	}

	private String encodePath(String caminho) {
		return URLEncoder.encode(caminho, StandardCharsets.UTF_8).replace("+", "%20").replace("%2F", "/");
	}

	private String storagePathAfterMarker(String url, String marker) {
		var markerIndex = url.indexOf(marker);
		if (markerIndex < 0) return null;
		var path = url.substring(markerIndex + marker.length());
		var endIndex = path.length();
		var queryIndex = path.indexOf('?');
		if (queryIndex >= 0) endIndex = Math.min(endIndex, queryIndex);
		var fragmentIndex = path.indexOf('#');
		if (fragmentIndex >= 0) endIndex = Math.min(endIndex, fragmentIndex);
		return URLDecoder.decode(path.substring(0, endIndex), StandardCharsets.UTF_8);
	}

	private boolean isStoragePath(String value) {
		return !value.contains("://")
				&& !value.startsWith("data:")
				&& !value.startsWith("content:")
				&& !value.startsWith("file:");
	}

	private String normalizeSignedUrl(String signedUrl) {
		if (signedUrl.startsWith("http://") || signedUrl.startsWith("https://")) {
			return signedUrl;
		}
		if (signedUrl.startsWith("/storage/v1")) {
			return supabaseUrl + signedUrl;
		}
		if (signedUrl.startsWith("/object/")) {
			return supabaseUrl + "/storage/v1" + signedUrl;
		}
		return supabaseUrl + "/storage/v1/" + signedUrl.replaceFirst("^/+", "");
	}
}
