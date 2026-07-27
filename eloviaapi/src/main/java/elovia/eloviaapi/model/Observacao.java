package elovia.eloviaapi.model;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "observacoes")
public class Observacao {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "sessao_id", nullable = false)
	private SessaoAcompanhamento sessao;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "aluno_id", nullable = false)
	private Aluno aluno;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private CategoriaObservacao categoria;

	@Column(nullable = false, columnDefinition = "text")
	private String descricao;

	@Column(length = 120)
	private String disciplina;

	@Column(length = 120)
	private String local;

	@Column(columnDefinition = "text")
	private String estrategia;

	@Column(columnDefinition = "text")
	private String resultado;

	@Column(name = "observacao_complementar", columnDefinition = "text")
	private String observacaoComplementar;

	@Enumerated(EnumType.STRING)
	@Column(name = "tipo_registro", nullable = false, length = 20)
	private TipoRegistro tipoRegistro = TipoRegistro.MANUAL;

	@Column(name = "audio_url", length = 700)
	private String audioUrl;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@PrePersist
	void antesDeCriar() {
		var agora = Instant.now();
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

	public SessaoAcompanhamento getSessao() {
		return sessao;
	}

	public void setSessao(SessaoAcompanhamento sessao) {
		this.sessao = sessao;
	}

	public Aluno getAluno() {
		return aluno;
	}

	public void setAluno(Aluno aluno) {
		this.aluno = aluno;
	}

	public CategoriaObservacao getCategoria() {
		return categoria;
	}

	public void setCategoria(CategoriaObservacao categoria) {
		this.categoria = categoria;
	}

	public String getDescricao() {
		return descricao;
	}

	public void setDescricao(String descricao) {
		this.descricao = descricao;
	}

	public String getDisciplina() {
		return disciplina;
	}

	public void setDisciplina(String disciplina) {
		this.disciplina = disciplina;
	}

	public String getLocal() {
		return local;
	}

	public void setLocal(String local) {
		this.local = local;
	}

	public String getEstrategia() {
		return estrategia;
	}

	public void setEstrategia(String estrategia) {
		this.estrategia = estrategia;
	}

	public String getResultado() {
		return resultado;
	}

	public void setResultado(String resultado) {
		this.resultado = resultado;
	}

	public String getObservacaoComplementar() {
		return observacaoComplementar;
	}

	public void setObservacaoComplementar(String observacaoComplementar) {
		this.observacaoComplementar = observacaoComplementar;
	}

	public TipoRegistro getTipoRegistro() {
		return tipoRegistro;
	}

	public void setTipoRegistro(TipoRegistro tipoRegistro) {
		this.tipoRegistro = tipoRegistro;
	}

	public String getAudioUrl() {
		return audioUrl;
	}

	public void setAudioUrl(String audioUrl) {
		this.audioUrl = audioUrl;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
