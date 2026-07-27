package elovia.eloviaapi.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "documentos_alunos")
public class DocumentoAluno {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(nullable = false, length = 180)
	private String titulo;

	@Column(columnDefinition = "text")
	private String descricao;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private CategoriaDocumento categoria;

	@Column(name = "nome_arquivo", nullable = false, length = 260)
	private String nomeArquivo;

	@Column(name = "tipo_arquivo", nullable = false, length = 120)
	private String tipoArquivo;

	@Column(name = "tamanho_arquivo", nullable = false)
	private long tamanhoArquivo;

	@Column(name = "url_arquivo", nullable = false, length = 700)
	private String urlArquivo;

	@Column(name = "caminho_arquivo", nullable = false, length = 500)
	private String caminhoArquivo;

	@Column(name = "data_documento")
	private LocalDate dataDocumento;

	@Column(name = "data_upload", nullable = false, updatable = false)
	private Instant dataUpload;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@Column(nullable = false)
	private boolean ativo = true;

	@ManyToOne(fetch = FetchType.LAZY)
	private Aluno aluno;

	@ManyToOne(fetch = FetchType.LAZY)
	private Usuario usuarioUpload;

	@ManyToOne(fetch = FetchType.LAZY)
	private Usuario usuarioUltimaEdicao;

	@Column(name = "data_ultima_edicao")
	private Instant dataUltimaEdicao;

	@PrePersist
	void antesDeCriar() {
		var agora = Instant.now();
		dataUpload = agora;
		createdAt = agora;
		updatedAt = agora;
	}

	@PreUpdate
	void antesDeAtualizar() {
		updatedAt = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public String getTitulo() {
		return titulo;
	}

	public void setTitulo(String titulo) {
		this.titulo = titulo;
	}

	public String getDescricao() {
		return descricao;
	}

	public void setDescricao(String descricao) {
		this.descricao = descricao;
	}

	public CategoriaDocumento getCategoria() {
		return categoria;
	}

	public void setCategoria(CategoriaDocumento categoria) {
		this.categoria = categoria;
	}

	public String getNomeArquivo() {
		return nomeArquivo;
	}

	public void setNomeArquivo(String nomeArquivo) {
		this.nomeArquivo = nomeArquivo;
	}

	public String getTipoArquivo() {
		return tipoArquivo;
	}

	public void setTipoArquivo(String tipoArquivo) {
		this.tipoArquivo = tipoArquivo;
	}

	public long getTamanhoArquivo() {
		return tamanhoArquivo;
	}

	public void setTamanhoArquivo(long tamanhoArquivo) {
		this.tamanhoArquivo = tamanhoArquivo;
	}

	public String getUrlArquivo() {
		return urlArquivo;
	}

	public void setUrlArquivo(String urlArquivo) {
		this.urlArquivo = urlArquivo;
	}

	public String getCaminhoArquivo() {
		return caminhoArquivo;
	}

	public void setCaminhoArquivo(String caminhoArquivo) {
		this.caminhoArquivo = caminhoArquivo;
	}

	public LocalDate getDataDocumento() {
		return dataDocumento;
	}

	public void setDataDocumento(LocalDate dataDocumento) {
		this.dataDocumento = dataDocumento;
	}

	public Instant getDataUpload() {
		return dataUpload;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	public boolean isAtivo() {
		return ativo;
	}

	public void setAtivo(boolean ativo) {
		this.ativo = ativo;
	}

	public Aluno getAluno() {
		return aluno;
	}

	public void setAluno(Aluno aluno) {
		this.aluno = aluno;
	}

	public Usuario getUsuarioUpload() {
		return usuarioUpload;
	}

	public void setUsuarioUpload(Usuario usuarioUpload) {
		this.usuarioUpload = usuarioUpload;
	}

	public Usuario getUsuarioUltimaEdicao() {
		return usuarioUltimaEdicao;
	}

	public void setUsuarioUltimaEdicao(Usuario usuarioUltimaEdicao) {
		this.usuarioUltimaEdicao = usuarioUltimaEdicao;
	}

	public Instant getDataUltimaEdicao() {
		return dataUltimaEdicao;
	}

	public void setDataUltimaEdicao(Instant dataUltimaEdicao) {
		this.dataUltimaEdicao = dataUltimaEdicao;
	}
}
