package elovia.eloviaapi.dto;

public record AlunoObservacoesRequest(
		String observacoesIniciais,
		String estrategias,
		String gatilhos,
		String preferencias,
		String interesses,
		String objetivosPdi,
		String formaComunicacao,
		String observacoes) {
}
