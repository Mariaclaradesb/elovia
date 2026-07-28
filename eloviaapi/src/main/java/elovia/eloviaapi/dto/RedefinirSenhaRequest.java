package elovia.eloviaapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RedefinirSenhaRequest(
		@NotBlank @Email String email,
		@NotBlank @Pattern(regexp = "\\d{8}", message = "O codigo deve ter 8 digitos") String codigo,
		@NotBlank @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres") String novaSenha,
		@NotBlank String confirmarSenha) {
}
