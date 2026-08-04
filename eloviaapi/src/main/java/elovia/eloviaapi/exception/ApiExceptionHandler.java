package elovia.eloviaapi.exception;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(NotFoundException.class)
	public ResponseEntity<Map<String, Object>> handleNotFound(NotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body(exception.getMessage()));
	}

	@ExceptionHandler(BusinessException.class)
	public ResponseEntity<Map<String, Object>> handleBusiness(BusinessException exception) {
		return ResponseEntity.badRequest().body(body(exception.getMessage()));
	}

	@ExceptionHandler(BadCredentialsException.class)
	public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException exception) {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body("Email ou senha inválidos."));
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException exception) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body("Acesso negado."));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException exception) {
		var message = exception.getBindingResult().getFieldErrors().stream()
				.findFirst()
				.map(error -> error.getField() + ": " + error.getDefaultMessage())
				.orElse("Dados invalidos");

		return ResponseEntity.badRequest().body(body(message));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<Map<String, Object>> handleUnreadableMessage(HttpMessageNotReadableException exception) {
		return ResponseEntity.badRequest().body(body(
				"Dados inválidos. Confira a data informada no formato DD-MM-AAAA."));
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException exception) {
		var cause = exception.getMostSpecificCause();
		var message = cause != null ? cause.getMessage() : exception.getMessage();
		if (message != null && message.contains("value too long")) {
			return ResponseEntity.badRequest().body(body("Um dos campos preenchidos esta maior que o limite permitido."));
		}
		return ResponseEntity.badRequest().body(body("Nao foi possivel salvar os dados informados."));
	}

	private Map<String, Object> body(String message) {
		return Map.of(
				"message", message,
				"timestamp", Instant.now().toString());
	}
}
