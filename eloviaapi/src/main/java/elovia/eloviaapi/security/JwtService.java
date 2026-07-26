package elovia.eloviaapi.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import elovia.eloviaapi.model.Role;
import elovia.eloviaapi.model.Usuario;

@Service
public class JwtService {

	private final String secret;
	private final long expirationMinutes;

	public JwtService(
			@Value("${app.jwt.secret}") String secret,
			@Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
		this.secret = secret;
		this.expirationMinutes = expirationMinutes;
	}

	public String generate(Usuario usuario) {
		var now = Instant.now();
		var header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
		var payload = "{"
				+ "\"sub\":\"" + usuario.getId() + "\","
				+ "\"email\":\"" + usuario.getEmail() + "\","
				+ "\"role\":\"" + usuario.getRole() + "\","
				+ "\"iat\":" + now.getEpochSecond() + ","
				+ "\"exp\":" + now.plusSeconds(expirationMinutes * 60).getEpochSecond()
				+ "}";

		var encodedHeader = base64Url(header.getBytes(StandardCharsets.UTF_8));
		var encodedPayload = base64Url(payload.getBytes(StandardCharsets.UTF_8));
		var unsigned = encodedHeader + "." + encodedPayload;
		return unsigned + "." + sign(unsigned);
	}

	public AuthenticatedUser validate(String token) {
		var parts = token.split("\\.");
		if (parts.length != 3) {
			throw new IllegalArgumentException("Token invalido");
		}

		var unsigned = parts[0] + "." + parts[1];
		if (!sign(unsigned).equals(parts[2])) {
			throw new IllegalArgumentException("Assinatura invalida");
		}

		var payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
		var exp = Long.parseLong(readJsonValue(payload, "exp"));
		if (Instant.now().getEpochSecond() > exp) {
			throw new IllegalArgumentException("Token expirado");
		}

		return new AuthenticatedUser(
				UUID.fromString(readJsonValue(payload, "sub")),
				readJsonValue(payload, "email"),
				Role.valueOf(readJsonValue(payload, "role")));
	}

	private String sign(String value) {
		try {
			var mac = Mac.getInstance("HmacSHA256");
			mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
			return base64Url(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
		} catch (Exception exception) {
			throw new IllegalStateException("Nao foi possivel assinar o token", exception);
		}
	}

	private String base64Url(byte[] bytes) {
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	private String readJsonValue(String json, String key) {
		var pattern = "\"" + key + "\":";
		var start = json.indexOf(pattern);
		if (start < 0) {
			throw new IllegalArgumentException("Token incompleto");
		}
		start += pattern.length();
		if (json.charAt(start) == '"') {
			var end = json.indexOf('"', start + 1);
			return json.substring(start + 1, end);
		}
		var end = json.indexOf(',', start);
		if (end < 0) {
			end = json.indexOf('}', start);
		}
		return json.substring(start, end);
	}
}
