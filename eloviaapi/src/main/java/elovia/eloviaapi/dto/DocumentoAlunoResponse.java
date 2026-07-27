package elovia.eloviaapi.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import elovia.eloviaapi.model.CategoriaDocumento;
import elovia.eloviaapi.model.DocumentoAluno;

public record DocumentoAlunoResponse(
		UUID id,
		String titulo,
		String descricao,
		CategoriaDocumento categoria,
		String nomeArquivo,
		String tipoArquivo,
		long tamanhoArquivo,
		String urlArquivo,
		LocalDate dataDocumento,
		Instant dataUpload,
		Instant createdAt,
		Instant updatedAt,
		boolean ativo,
		UUID alunoId,
		String alunoNome,
		UUID usuarioUploadId,
		String usuarioUploadNome,
		UUID usuarioUltimaEdicaoId,
		String usuarioUltimaEdicaoNome,
		Instant dataUltimaEdicao) {

	public static DocumentoAlunoResponse from(DocumentoAluno documento) {
		var aluno = documento.getAluno();
		var upload = documento.getUsuarioUpload();
		var ultimaEdicao = documento.getUsuarioUltimaEdicao();
		return new DocumentoAlunoResponse(
				documento.getId(),
				documento.getTitulo(),
				documento.getDescricao(),
				documento.getCategoria(),
				documento.getNomeArquivo(),
				documento.getTipoArquivo(),
				documento.getTamanhoArquivo(),
				documento.getUrlArquivo(),
				documento.getDataDocumento(),
				documento.getDataUpload(),
				documento.getCreatedAt(),
				documento.getUpdatedAt(),
				documento.isAtivo(),
				aluno != null ? aluno.getId() : null,
				aluno != null ? aluno.getNome() : null,
				upload != null ? upload.getId() : null,
				upload != null ? upload.getNome() : null,
				ultimaEdicao != null ? ultimaEdicao.getId() : null,
				ultimaEdicao != null ? ultimaEdicao.getNome() : null,
				documento.getDataUltimaEdicao());
	}
}
