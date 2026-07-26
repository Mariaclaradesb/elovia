package elovia.eloviaapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CadastrarAdminRequest(
		@NotBlank String nome,
		@NotBlank String cpf,
		@NotBlank @Email String email,
		@NotBlank String telefone,
		@NotBlank String escola,
		@NotBlank String senha,
		@NotBlank String confirmarSenha) {
}
